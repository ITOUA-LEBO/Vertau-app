"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Play, Clock, TrendingUp, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { cn, scoreColor, formatMinutes } from "@/lib/utils";
import { useJobs } from "@/hooks/useJobs";
import { api } from "@/lib/api";
import type { Clip, Platform, Job } from "@/types";

const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: "TikTok",
  reels: "Reels",
  shorts: "Shorts",
};

type SortKey = "score" | "date" | "duration";
type FilterPlatform = Platform | "all";

function formatDuration(start: number, end: number): string {
  const s = Math.round(end - start);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${(s % 60).toString().padStart(2, "0")}` : `0:${s.toString().padStart(2, "0")}`;
}

function ClipCard({ clip, jobTitle, index }: { clip: Clip; jobTitle: string; index: number }) {
  const color = scoreColor(clip.score);

  const handleDownload = async () => {
    try {
      const { download_url } = await api.getDownloadUrl(clip.id);
      window.open(download_url, "_blank");
    } catch {
      alert("Erreur lors du téléchargement.");
    }
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-xl overflow-hidden border flex flex-col bg-[#171310]",
        clip.score >= 9 ? "border-[#FBBF24]/30" : "border-[#302B27]",
        "hover:border-[#5C5248] transition-all duration-200 group"
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
    >
      {/* Preview 9:16 */}
      <div className="relative w-full" style={{ aspectRatio: "9/16", background: "#0C0A09" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1A1510 0%, #0C0A09 100%)" }} />
        <div className="absolute inset-x-0 top-0 h-px bg-[#FBBF24]/8" />

        {/* Play */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#FAF7F4]/5 border border-[#FAF7F4]/10 flex items-center justify-center group-hover:bg-[#FBBF24]/10 group-hover:border-[#FBBF24]/20 transition-all">
            <Play className="w-4 h-4 text-[#FAF7F4]/40 group-hover:text-[#FBBF24] ml-0.5 transition-colors" fill="currentColor" />
          </div>
        </div>

        {/* Score */}
        <div
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-[#0C0A09]"
          style={{ backgroundColor: color }}
        >
          {clip.score}
        </div>

        {/* Plateforme */}
        <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-[#0C0A09]/70 border border-[#302B27] text-[#A8988A] font-medium">
          {PLATFORM_LABELS[clip.platform] ?? clip.platform}
        </span>

        {clip.score >= 9 && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 30% at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 70%)" }} />
        )}
      </div>

      {/* Infos */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-xs font-semibold text-[#FAF7F4] leading-snug line-clamp-2">{clip.title}</p>
        <p className="text-[10px] text-[#5C5248] truncate">{jobTitle}</p>
        <div className="flex items-center gap-2 text-[10px] text-[#5C5248]">
          <Clock className="w-3 h-3" />
          <span>{formatDuration(clip.startTime, clip.endTime)}</span>
          <TrendingUp className="w-3 h-3 ml-auto" style={{ color }} />
          <span style={{ color }}>{clip.score}/10</span>
        </div>
        <button
          onClick={handleDownload}
          className="mt-auto w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-[#211D1A] border border-[#302B27] text-[#A8988A] hover:bg-[#FBBF24]/10 hover:border-[#FBBF24]/30 hover:text-[#FBBF24] active:scale-95 transition-all"
        >
          <Download className="w-3 h-3" />
          Télécharger
        </button>
      </div>
    </motion.div>
  );
}

export default function ClipsPage() {
  const { data: jobs, isLoading } = useJobs();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [filterPlatform, setFilterPlatform] = useState<FilterPlatform>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Aplatit tous les clips de tous les jobs terminés
  const allClips: { clip: Clip; job: Job }[] = (jobs ?? [])
    .filter((j) => j.status === "done")
    .flatMap((job) => (job.clips ?? []).map((clip) => ({ clip, job })));

  const filtered = allClips
    .filter(({ clip }) => {
      const matchSearch = !search || clip.title.toLowerCase().includes(search.toLowerCase());
      const matchPlatform = filterPlatform === "all" || clip.platform === filterPlatform;
      return matchSearch && matchPlatform;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.clip.score - a.clip.score;
      if (sortBy === "date") return new Date(b.clip.createdAt).getTime() - new Date(a.clip.createdAt).getTime();
      if (sortBy === "duration") return (b.clip.endTime - b.clip.startTime) - (a.clip.endTime - a.clip.startTime);
      return 0;
    });

  const totalDuration = filtered.reduce((s, { clip }) => s + (clip.endTime - clip.startTime), 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xs text-[#5C5248] uppercase tracking-widest font-medium mb-1">
            Bibliothèque de clips
          </h2>
          {!isLoading && (
            <p className="text-sm text-[#A8988A]">
              {filtered.length} clip{filtered.length > 1 ? "s" : ""}
              {filtered.length > 0 && (
                <span className="text-[#5C5248]"> · {formatMinutes(totalDuration / 60)} de contenu</span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
            showFilters
              ? "bg-[#211D1A] border-[#FBBF24]/30 text-[#FBBF24]"
              : "bg-[#171310] border-[#302B27] text-[#A8988A] hover:border-[#5C5248]"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
        </button>
      </div>

      {/* Barre recherche + filtres */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C5248]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un clip..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-[#171310] border border-[#302B27] text-[#FAF7F4] placeholder-[#5C5248] focus:outline-none focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/15 transition-all"
          />
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-4 p-4 rounded-lg bg-[#171310] border border-[#302B27]"
          >
            {/* Tri */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-[#5C5248] uppercase tracking-wide font-medium">Trier par</p>
              <div className="flex gap-1.5">
                {([
                  { key: "score", label: "Score" },
                  { key: "date", label: "Date" },
                  { key: "duration", label: "Durée" },
                ] as { key: SortKey; label: string }[]).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                      sortBy === opt.key
                        ? "bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24]"
                        : "bg-[#211D1A] border-[#302B27] text-[#5C5248] hover:text-[#A8988A]"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Plateforme */}
            <div className="space-y-1.5">
              <p className="text-[11px] text-[#5C5248] uppercase tracking-wide font-medium">Plateforme</p>
              <div className="flex gap-1.5">
                {(["all", "tiktok", "reels", "shorts"] as FilterPlatform[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPlatform(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                      filterPlatform === p
                        ? "bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24]"
                        : "bg-[#211D1A] border-[#302B27] text-[#5C5248] hover:text-[#A8988A]"
                    )}
                  >
                    {p === "all" ? "Toutes" : PLATFORM_LABELS[p as Platform]}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-5 h-5 text-[#5C5248] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-3">
          <p className="text-sm text-[#5C5248]">
            {allClips.length === 0
              ? "Aucun clip encore. Lance ton premier traitement."
              : "Aucun clip ne correspond à ta recherche."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(({ clip, job }, i) => (
            <ClipCard
              key={clip.id}
              clip={clip}
              jobTitle={job.sourceTitle ?? "Sans titre"}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
