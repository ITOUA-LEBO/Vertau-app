"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { Download, Package, Play, Clock, TrendingUp, Smartphone, Loader2, AlertCircle, Upload } from "lucide-react";
import { cn, scoreColor, formatMinutes } from "@/lib/utils";
import { useJob } from "@/hooks/useJobs";
import { useJobPolling } from "@/hooks/useJobPolling";
import { api } from "@/lib/api";
import type { Platform } from "@/types";

const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: "TikTok",
  reels: "Reels",
  shorts: "Shorts",
};

function formatDuration(start: number, end: number): string {
  const s = Math.round(end - start);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `0:${sec.toString().padStart(2, "0")}`;
}

function ClipCard({ clip, index }: { clip: Record<string, unknown>; index: number }) {
  const score = clip.score as number;
  const color = scoreColor(score);
  const isViral = score >= 9;
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      const { download_url } = await api.getDownloadUrl(clip.id as string);
      window.open(download_url, "_blank");
    } catch {
      alert("Erreur lors du téléchargement.");
    }
  };

  const handlePublishYouTube = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/youtube/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clipId: clip.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPublishedUrl(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la publication.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-xl overflow-hidden border flex flex-col bg-[#171310]",
        isViral ? "border-[#FBBF24]/30" : "border-[#302B27]",
        "hover:border-[#5C5248] transition-all duration-200 group"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      {/* Preview 9:16 */}
      <div className="relative w-full bg-[#0C0A09]" style={{ aspectRatio: "9/16" }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1A1510 0%, #0C0A09 100%)" }} />
        <div className="absolute inset-x-0 top-0 h-px bg-[#FBBF24]/8" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F4]/5 border border-[#FAF7F4]/10 flex items-center justify-center group-hover:bg-[#FBBF24]/10 group-hover:border-[#FBBF24]/20 transition-all">
            <Play className="w-5 h-5 text-[#FAF7F4]/40 group-hover:text-[#FBBF24] ml-0.5 transition-colors" fill="currentColor" />
          </div>
        </div>
        {/* Score */}
        <div
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-[#0C0A09]"
          style={{ backgroundColor: color }}
        >
          {score}
        </div>
        {/* Plateforme */}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0C0A09]/70 border border-[#302B27] text-[#A8988A] font-medium">
            {PLATFORM_LABELS[clip.platform as Platform] ?? clip.platform as string}
          </span>
        </div>
        {isViral && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 30% at 50% 0%, rgba(251,191,36,0.06) 0%, transparent 70%)" }} />
        )}
      </div>

      {/* Infos */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-xs font-semibold text-[#FAF7F4] leading-snug line-clamp-2">
          {clip.title as string}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-[#5C5248]">
          <Clock className="w-3 h-3" />
          <span>{formatDuration(clip.start_time as number, clip.end_time as number)}</span>
          <TrendingUp className="w-3 h-3 ml-1" style={{ color }} />
          <span style={{ color }}>Score {score}/10</span>
        </div>
        <div className="mt-auto flex flex-col gap-1.5">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-[#211D1A] border border-[#302B27] text-[#A8988A] hover:bg-[#FBBF24]/10 hover:border-[#FBBF24]/30 hover:text-[#FBBF24] active:scale-95 transition-all"
          >
            <Download className="w-3 h-3" />
            Télécharger
          </button>

          {publishedUrl ? (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF6666] hover:bg-[#FF0000]/15 transition-all"
            >
              <Upload className="w-3 h-3" />
              Voir le Short ↗
            </a>
          ) : (
            <button
              onClick={handlePublishYouTube}
              disabled={publishing}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold bg-[#171310] border border-[#302B27] text-[#5C5248] hover:bg-[#FF0000]/10 hover:border-[#FF0000]/30 hover:text-[#FF6666] active:scale-95 transition-all disabled:opacity-50"
            >
              {publishing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Upload className="w-3 h-3" />
                  Publier Short
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: job, isLoading } = useJob(id);
  const { data: liveStatus } = useJobPolling(
    job && !["done", "failed"].includes(job.status) ? id : null
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 text-[#5C5248] animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-2 text-[#F87171]">
        <AlertCircle className="w-4 h-4" />
        <p className="text-sm">Job introuvable.</p>
      </div>
    );
  }

  const status = liveStatus?.status ?? job.status;
  const clips = (job.clips ?? []) as Record<string, unknown>[];
  const isDone = status === "done";

  // Job en cours de traitement
  if (!isDone && status !== "failed") {
    const progress = liveStatus?.progress ?? 0;
    const step = liveStatus?.current_step ?? "Traitement en cours...";
    return (
      <div className="max-w-lg mx-auto space-y-8 pt-16 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-serif text-[#FAF7F4]">{job.source_title ?? "Traitement en cours"}</h2>
          <p className="text-sm text-[#5C5248]">{step}</p>
        </div>
        <div className="space-y-2">
          <div className="h-1 bg-[#211D1A] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#FBBF24] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-[#5C5248]">{progress}%</p>
        </div>
        <Loader2 className="w-5 h-5 text-[#5C5248] animate-spin mx-auto" />
      </div>
    );
  }

  // Job échoué
  if (status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-8 h-8 text-[#F87171]" />
        <p className="text-sm text-[#F87171]">{job.error_message ?? "Le traitement a échoué."}</p>
      </div>
    );
  }

  const bestScore = clips.length ? Math.max(...clips.map((c) => c.score as number)) : 0;
  const avgScore = clips.length
    ? (clips.reduce((s, c) => s + (c.score as number), 0) / clips.length).toFixed(1)
    : "0";
  const totalDuration = clips.reduce(
    (s, c) => s + ((c.end_time as number) - (c.start_time as number)), 0
  );

  const handleDownloadAll = () => {
    clips.forEach((clip) => {
      api.getDownloadUrl(clip.id as string).then(({ download_url }) => {
        const a = document.createElement("a");
        a.href = download_url;
        a.download = `${clip.title}.mp4`;
        a.click();
      });
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif text-[#FAF7F4]">{job.source_title ?? "Sans titre"}</h2>
          <div className="flex items-center gap-3 text-xs text-[#5C5248]">
            <span>{clips.length} clips</span>
            <span className="text-[#302B27]">·</span>
            <span>{formatMinutes((job.duration_sec ?? 0) / 60)} source</span>
            <span className="text-[#302B27]">·</span>
            <span>{formatMinutes(totalDuration / 60)} de clips</span>
          </div>
        </div>
        <button
          onClick={handleDownloadAll}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FBBF24] text-[#0C0A09] text-sm font-semibold hover:bg-[#F59E0B] active:scale-95 transition-all"
        >
          <Package className="w-4 h-4" />
          Tout télécharger
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Meilleur score", value: `${bestScore}/10`, color: scoreColor(bestScore), icon: TrendingUp },
          { label: "Score moyen", value: avgScore, color: scoreColor(parseFloat(avgScore)), icon: TrendingUp },
          { label: "Contenu généré", value: formatMinutes(totalDuration / 60), color: "#A8988A", icon: Smartphone },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl bg-[#171310] border border-[#302B27]">
            <stat.icon className="w-5 h-5 flex-shrink-0" style={{ color: stat.color }} />
            <div>
              <p className="text-lg font-black text-[#FAF7F4]" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-xs text-[#5C5248]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">
        {clips.length} clips · Triés par score
      </p>

      {/* Grille */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {[...clips]
          .sort((a, b) => (b.score as number) - (a.score as number))
          .map((clip, i) => (
            <ClipCard key={clip.id as string} clip={clip} index={i} />
          ))}
      </div>
    </div>
  );
}
