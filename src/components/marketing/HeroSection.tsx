"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_CLIPS = [
  { score: 9, duration: "0:52", title: "La tech qui triple tes vues" },
  { score: 8, duration: "1:04", title: "Ce que personne ne dit..." },
  { score: 7, duration: "0:41", title: "Résultat en 7 jours" },
];

export function HeroSection() {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Fond radial chaud */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(251,191,36,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Marque de coupe diagonale décorative */}
      <div
        className="absolute top-0 right-0 w-px h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(251,191,36,0.12) 30%, rgba(251,191,36,0.12) 70%, transparent 100%)",
          transform: "rotate(8deg) translateX(-200px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* ── Gauche : texte + input ── */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#302B27] text-xs text-[#A8988A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                Nouveau · Templates TikTok / Reels / Shorts
              </span>
            </motion.div>

            {/* Titre */}
            <div className="overflow-hidden">
              <motion.h1
                className="font-serif text-5xl lg:text-7xl text-[#FAF7F4] leading-[1.05] tracking-tight"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                Tes meilleures{" "}
                <span className="italic text-[#FBBF24]">minutes,</span>
                <br />
                automatiquement.
              </motion.h1>
            </div>

            {/* Sous-titre */}
            <motion.p
              className="text-lg text-[#A8988A] leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Colle une URL YouTube ou upload une vidéo. Vertau détecte les
              moments forts, reformate en 9:16 et génère tes clips viraux en
              quelques minutes.
            </motion.p>

            {/* Input URL */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className={cn(
                      "w-full px-4 py-3 rounded-lg text-sm",
                      "bg-[#211D1A] border border-[#302B27]",
                      "text-[#FAF7F4] placeholder-[#5C5248]",
                      "focus:outline-none focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/15",
                      "transition-all duration-200"
                    )}
                  />
                </div>
                <button
                  className={cn(
                    "inline-flex items-center gap-2 px-5 py-3 rounded-lg",
                    "bg-[#FBBF24] text-[#0C0A09] text-sm font-semibold",
                    "hover:bg-[#F59E0B] active:scale-95",
                    "transition-all duration-150",
                    "whitespace-nowrap"
                  )}
                >
                  Lancer
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#5C5248]">
                ✓ Gratuit · 30 min/mois · Sans carte bancaire
              </p>
            </motion.div>
          </div>

          {/* ── Droite : clips démo ── */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Glow ambre derrière les clips */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(251,191,36,0.06) 0%, transparent 70%)",
              }}
            />

            <div className="flex gap-4 items-end justify-center">
              {DEMO_CLIPS.map((clip, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "relative flex-shrink-0 rounded-xl overflow-hidden",
                    "border border-[#302B27]",
                    "bg-[#171310]",
                    i === 1 ? "w-36" : "w-28"
                  )}
                  style={{
                    aspectRatio: "9/16",
                    transform: i === 0 ? "rotate(-3deg)" : i === 2 ? "rotate(3deg)" : "rotate(-1deg)",
                    marginBottom: i === 1 ? "0px" : "20px",
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
                  whileHover={{ scale: 1.03, rotate: 0, zIndex: 10 }}
                >
                  {/* Preview gradient */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, #211D1A 0%, #171310 100%)`,
                    }}
                  />

                  {/* Lignes déco (frame cinéma) */}
                  <div className="absolute inset-x-0 top-0 h-px bg-[#FBBF24]/10" />
                  <div className="absolute inset-x-0 bottom-12 h-px bg-[#FBBF24]/10" />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/20 flex items-center justify-center">
                      <Play className="w-4 h-4 text-[#FBBF24] ml-0.5" fill="#FBBF24" />
                    </div>
                  </div>

                  {/* Score badge */}
                  <div
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-[#0C0A09]"
                    style={{ backgroundColor: clip.score >= 9 ? "#FBBF24" : clip.score >= 7 ? "#4ADE80" : "#FB923C" }}
                  >
                    {clip.score}
                  </div>

                  {/* Infos bas */}
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-[#0C0A09] to-transparent">
                    <p className="text-[10px] text-[#FAF7F4] font-medium leading-tight truncate">
                      {clip.title}
                    </p>
                    <p className="text-[10px] text-[#5C5248] mt-0.5">{clip.duration}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          className="mt-20 pt-8 border-t border-[#1F1B18] flex flex-wrap gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { value: "5 min", label: "Temps de traitement moyen" },
            { value: "9:16", label: "Format vertical natif" },
            { value: "~0,08€", label: "Par minute de vidéo" },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <p className="text-2xl font-semibold text-[#FAF7F4]">{stat.value}</p>
              <p className="text-sm text-[#5C5248]">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
