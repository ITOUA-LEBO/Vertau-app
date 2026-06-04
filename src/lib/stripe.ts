import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
});

export const PLAN_PRICE_IDS: Record<string, string> = {
  creator: process.env.STRIPE_PRICE_CREATOR ?? "",
  pro:     process.env.STRIPE_PRICE_PRO ?? "",
  agency:  process.env.STRIPE_PRICE_AGENCY ?? "",
};

export const PLAN_MINUTES: Record<string, number> = {
  free:    30,
  creator: 150,
  pro:     600,
  agency:  2000,
};

export const PLAN_OVERAGE: Record<string, number | null> = {
  free:    null,
  creator: 0.08,
  pro:     0.06,
  agency:  0.04,
};
