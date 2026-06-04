"use client";

import { motion } from "framer-motion";
import { LinkIcon, Sparkles, Scissors, Download } from "lucide-react";

const STEPS = [
  {
    icon: LinkIcon,
    number: "01",
    title: "Importe ta vidéo",
    description: "Colle une URL YouTube ou upload directement. MP4, MOV, MKV jusqu'à 5 Go.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "L'IA analyse tout",
    description: "Transcription automatique puis détection des moments forts — rires, révélations, conseils chocs.",
  },
  {
    icon: Scissors,
    number: "03",
    title: "Tu choisis tes clips",
    description: "Vertau te propose les meilleurs moments avec un score de viralité. Tu valides, tu ajustes.",
  },
  {
    icon: Download,
    number: "04",
    title: "Exporte et publie",
    description: "Clips 9:16 avec tes sous-titres et ton branding, prêts pour TikTok, Reels et Shorts.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-32 relative">
      {/* Ligne décorative */}
      <div className="absolute left-1/2 top-0 w-px h-16 bg-gradient-to-b from-transparent to-[#302B27]" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-20 space-y-3">
          <p className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">
            Comment ça marche
          </p>
          <h2 className="font-serif text-4xl lg:text-5xl text-[#FAF7F4] max-w-lg leading-tight">
            De la vidéo longue au clip viral{" "}
            <span className="italic text-[#FBBF24]">en 5 minutes.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#302B27]">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              className="bg-[#0C0A09] p-8 space-y-6 group hover:bg-[#171310] transition-colors duration-200"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Numéro + icône */}
              <div className="flex items-start justify-between">
                <span className="text-5xl font-black text-[#1F1B18] select-none leading-none">
                  {step.number}
                </span>
                <div className="w-10 h-10 rounded-lg bg-[#211D1A] border border-[#302B27] flex items-center justify-center group-hover:border-[#FBBF24]/30 transition-colors">
                  <step.icon className="w-5 h-5 text-[#FBBF24]" />
                </div>
              </div>

              {/* Texte */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[#FAF7F4]">
                  {step.title}
                </h3>
                <p className="text-sm text-[#A8988A] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
