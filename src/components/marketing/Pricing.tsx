"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_LIMITS } from "@/types";

const PLANS = [
  {
    key: "free",
    price: 0,
    features: [
      "30 min/mois incluses",
      "Watermark Vertau",
      "Templates de base",
      "Export 1080p",
    ],
    cta: "Commencer gratuitement",
    highlight: false,
  },
  {
    key: "creator",
    price: 12,
    features: [
      "150 min/mois incluses",
      "+0,08€/min dépassement",
      "Sans watermark",
      "Tous les templates",
      "Branding custom",
      "Export 1080p",
    ],
    cta: "Choisir Creator",
    highlight: false,
  },
  {
    key: "pro",
    price: 29,
    features: [
      "600 min/mois incluses",
      "+0,06€/min dépassement",
      "Sans watermark",
      "Tous les templates",
      "Branding custom",
      "Export 4K",
      "Priorité de traitement",
    ],
    cta: "Choisir Pro",
    highlight: true,
  },
  {
    key: "agency",
    price: 79,
    features: [
      "2 000 min/mois incluses",
      "+0,04€/min dépassement",
      "10 utilisateurs",
      "Multi-workspace",
      "Branding par workspace",
      "Export 4K",
      "Support prioritaire",
    ],
    cta: "Choisir Agency",
    highlight: false,
  },
] as const;

export function Pricing() {
  return (
    <section id="pricing" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16 space-y-3">
          <p className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">
            Tarifs
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl text-[#FAF7F4] leading-tight">
            Simple.{" "}
            <span className="italic text-[#FBBF24]">Transparent.</span>
          </h2>
          <p className="text-[#A8988A] max-w-lg">
            Minutes incluses chaque mois. Si tu débordEs, on facture à la
            minute — pas besoin de changer de plan.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              className={cn(
                "relative rounded-xl p-6 flex flex-col gap-6",
                plan.highlight
                  ? "bg-[#171310] border-2 border-[#FBBF24]/40"
                  : "bg-[#171310] border border-[#302B27]"
              )}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              {/* Badge "Populaire" */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#FBBF24] text-[#0C0A09] text-xs font-semibold">
                  Populaire
                </div>
              )}

              {/* Plan name */}
              <div>
                <p className="text-xs text-[#5C5248] uppercase tracking-widest font-medium mb-1">
                  {PLAN_LIMITS[plan.key].label}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-[#FAF7F4]">
                    {plan.price === 0 ? "0" : plan.price}
                    <span className="text-lg font-medium text-[#A8988A]">€</span>
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-[#5C5248] mb-1">/mois</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-[#FBBF24] flex-shrink-0 mt-0.5" />
                    <span className="text-[#A8988A]">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={cn(
                  "w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150",
                  plan.highlight
                    ? "bg-[#FBBF24] text-[#0C0A09] hover:bg-[#F59E0B] active:scale-95"
                    : "bg-[#211D1A] text-[#FAF7F4] border border-[#302B27] hover:border-[#5C5248] active:scale-95"
                )}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Note dépassement */}
        <p className="mt-8 text-center text-xs text-[#5C5248]">
          Le dépassement est facturé automatiquement en fin de mois. Aucune
          surprise — tu peux voir ta consommation en temps réel.
        </p>
      </div>
    </section>
  );
}
