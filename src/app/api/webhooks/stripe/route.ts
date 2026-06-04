import { NextResponse } from "next/server";
import { stripe, PLAN_MINUTES, PLAN_OVERAGE } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    // ── Abonnement créé ou mis à jour ────────────────────────
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      const plan = sub.metadata?.plan ?? "free";

      if (!userId) break;

      await supabase.from("profiles").update({
        plan,
        stripe_subscription_id: sub.id,
        minutes_included: PLAN_MINUTES[plan] ?? 30,
        overage_rate: PLAN_OVERAGE[plan] ?? null,
      }).eq("id", userId);

      // Upsert dans la table subscriptions
      const periodStart = (sub as unknown as { current_period_start?: number }).current_period_start;
      const periodEnd   = (sub as unknown as { current_period_end?: number }).current_period_end;

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_subscription_id: sub.id,
        plan,
        status: sub.status,
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        current_period_end:   periodEnd   ? new Date(periodEnd   * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      break;
    }

    // ── Abonnement annulé ────────────────────────────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;

      if (!userId) break;

      await supabase.from("profiles").update({
        plan: "free",
        stripe_subscription_id: null,
        minutes_included: 30,
        overage_rate: null,
      }).eq("id", userId);

      await supabase.from("subscriptions").update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      }).eq("user_id", userId);

      break;
    }

    // ── Paiement échoué ──────────────────────────────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        await supabase.from("subscriptions").update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        }).eq("user_id", profile.id);
      }

      break;
    }

    // ── Reset quota mensuel (nouveau cycle) ──────────────────
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason !== "subscription_cycle") break;

      const customerId = invoice.customer as string;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        await supabase.from("profiles").update({
          minutes_used: 0,
          quota_reset_at: new Date().toISOString(),
        }).eq("id", profile.id);
      }

      break;
    }
  }

  return NextResponse.json({ received: true });
}
