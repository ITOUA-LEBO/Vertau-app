"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Plan } from "@/types";

const PLANS = [
  {
    key: "free" as Plan,
    label: "Free",
    price: 0,
    minutes: 30,
    overage: null,
    features: ["30 min/mois", "Watermark Vertau", "Templates de base", "Export 1080p"],
  },
  {
    key: "creator" as Plan,
    label: "Creator",
    price: 12,
    minutes: 150,
    overage: 0.08,
    features: ["150 min/mois", "+0,08€/min dépassement", "Sans watermark", "Tous les templates", "Branding custom", "Export 1080p"],
  },
  {
    key: "pro" as Plan,
    label: "Pro",
    price: 29,
    minutes: 600,
    overage: 0.06,
    features: ["600 min/mois", "+0,06€/min dépassement", "Sans watermark", "Tous les templates", "Branding custom", "Export 4K", "Priorité de traitement"],
    highlight: true,
  },
  {
    key: "agency" as Plan,
    label: "Agency",
    price: 79,
    minutes: 2000,
    overage: 0.04,
    features: ["2 000 min/mois", "+0,04€/min dépassement", "10 utilisateurs", "Multi-workspace", "Branding par workspace", "Export 4K", "Support prioritaire"],
  },
];

type Profile = {
  plan: Plan;
  minutes_included: number;
  minutes_used: number;
};

export default function BillingPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<Plan | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("plan, minutes_included, minutes_used")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data as Profile);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const currentPlan = profile?.plan ?? "free";
  const minutesUsed = Math.round(profile?.minutes_used ?? 0);
  const minutesTotal = profile?.minutes_included ?? 30;
  const pct = Math.min(Math.round((minutesUsed / minutesTotal) * 100), 100);
  const quotaColor = pct >= 90 ? "#F87171" : pct >= 70 ? "#FB923C" : "#FBBF24";

  const PAYMENT_LINKS: Record<string, string> = {
    creator: "https://buy.stripe.com/28EfZg68XaAH52T7Lm87K05",
    pro:     "https://buy.stripe.com/9B6cN4apd4cj2ULfdO87K06",
    agency:  "https://buy.stripe.com/9B6aEWfJxgZ57b19Tu87K07",
  };

  const handleUpgrade = (plan: Plan) => {
    if (plan === currentPlan) return;
    const url = PAYMENT_LINKS[plan];
    if (url) window.location.href = url;
  };

  const handlePortal = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.open(url, "_blank");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur portail Stripe");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 text-[#5C5248] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-16">
      <div>
        <h2 className="text-2xl font-serif text-[#FAF7F4]">Abonnement</h2>
        <p className="text-sm text-[#5C5248] mt-1">Gère ton plan et tes minutes.</p>
      </div>

      {/* ── Usage actuel ── */}
      <div className="p-5 rounded-xl bg-[#171310] border border-[#302B27] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#5C5248] uppercase tracking-wide font-medium mb-1">Plan actuel</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-[#FAF7F4]">
                {PLANS.find((p) => p.key === currentPlan)?.label ?? "Free"}
              </span>
              {currentPlan !== "free" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/20 text-[#FBBF24]">
                  Actif
                </span>
              )}
            </div>
          </div>
          {currentPlan !== "free" && (
            <button
              onClick={handlePortal}
              className="flex items-center gap-1.5 text-xs text-[#5C5248] hover:text-[#A8988A] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Gérer via Stripe
            </button>
          )}
        </div>

        {/* Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A8988A]">Minutes ce mois</span>
            <span style={{ color: quotaColor }} className="font-semibold">
              {minutesUsed} / {minutesTotal} min
            </span>
          </div>
          <div className="h-2 bg-[#211D1A] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: quotaColor }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-[11px] text-[#5C5248]">
            {minutesTotal - minutesUsed} min restantes · Reset le 1er du mois
          </p>
        </div>

        {/* Dépassement */}
        {currentPlan !== "free" && (
          <div className="pt-2 border-t border-[#1F1B18]">
            <p className="text-xs text-[#5C5248]">
              Dépassement :{" "}
              <span className="text-[#A8988A]">
                {PLANS.find((p) => p.key === currentPlan)?.overage}€/min
              </span>
              {" · "}
              Facturé en fin de mois si utilisé
            </p>
          </div>
        )}
      </div>

      {/* ── Plans ── */}
      <div>
        <p className="text-xs text-[#5C5248] uppercase tracking-widest font-medium mb-5">
          Changer de plan
        </p>
        <div className="grid grid-cols-2 gap-4">
          {PLANS.map((plan, i) => {
            const isCurrent = plan.key === currentPlan;
            const isDowngrade = PLANS.findIndex((p) => p.key === plan.key) < PLANS.findIndex((p) => p.key === currentPlan);

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className={cn(
                  "relative rounded-xl p-5 border flex flex-col gap-4",
                  isCurrent
                    ? "bg-[#211D1A] border-[#FBBF24]/40"
                    : "bg-[#171310] border-[#302B27]",
                  plan.highlight && !isCurrent && "border-[#302B27]"
                )}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-[#FBBF24] text-[#0C0A09] text-[10px] font-semibold">
                    Plan actuel
                  </div>
                )}
                {plan.highlight && !isCurrent && (
                  <div className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-[#211D1A] border border-[#302B27] text-[#A8988A] text-[10px] font-semibold">
                    Populaire
                  </div>
                )}

                <div>
                  <p className="text-xs text-[#5C5248] uppercase tracking-wide mb-1">{plan.label}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-[#FAF7F4]">
                      {plan.price === 0 ? "0" : plan.price}
                      <span className="text-base font-medium text-[#A8988A]">€</span>
                    </span>
                    {plan.price > 0 && <span className="text-xs text-[#5C5248] mb-1">/mois</span>}
                  </div>
                </div>

                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-[#FBBF24] flex-shrink-0 mt-0.5" />
                      <span className="text-[#A8988A]">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={isCurrent || !!upgrading}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all",
                    isCurrent
                      ? "bg-[#302B27] text-[#5C5248] cursor-default"
                      : isDowngrade
                      ? "bg-[#211D1A] border border-[#302B27] text-[#A8988A] hover:border-[#5C5248]"
                      : "bg-[#FBBF24] text-[#0C0A09] hover:bg-[#F59E0B] active:scale-95"
                  )}
                >
                  {upgrading === plan.key ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : isCurrent ? (
                    "Plan actuel"
                  ) : isDowngrade ? (
                    "Réduire"
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Passer à {plan.label}
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Historique facturation ── */}
      <div>
        <p className="text-xs text-[#5C5248] uppercase tracking-widest font-medium mb-4">
          Historique de facturation
        </p>
        <div className="rounded-xl bg-[#171310] border border-[#302B27] divide-y divide-[#1F1B18]">
          {currentPlan === "free" ? (
            <div className="p-6 text-center">
              <p className="text-sm text-[#5C5248]">Aucune facture — plan gratuit</p>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-[#5C5248]">
                Accède à ton historique complet via{" "}
                <button
                  onClick={handlePortal}
                  className="text-[#A8988A] underline hover:text-[#FAF7F4] transition-colors"
                >
                  le portail Stripe
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
