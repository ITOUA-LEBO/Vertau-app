"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Upload, X, Film, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Platform, SubtitleStyle, Template } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

type SourceMode = "url" | "upload";

const SUPPORTED_PLATFORMS = [
  "YouTube", "Vimeo", "Twitch", "Dailymotion", "Instagram",
  "Facebook", "Twitter / X", "TikTok", "Spotify (podcast)",
  "Lien direct (.mp4 / .mov)",
];

const PLATFORMS: { key: Platform; label: string }[] = [
  { key: "tiktok", label: "TikTok" },
  { key: "reels", label: "Reels" },
  { key: "shorts", label: "Shorts" },
];

const SUBTITLE_STYLES: { key: SubtitleStyle; label: string; desc: string }[] = [
  { key: "karaoke", label: "Karaoké", desc: "Mot par mot" },
  { key: "highlight", label: "Highlight", desc: "Mot actif coloré" },
  { key: "impact", label: "Impact", desc: "Gros titres" },
];

const TEMPLATES: { key: Template; label: string; desc: string }[] = [
  { key: "minimal", label: "Minimal", desc: "Sobre, texte blanc" },
  { key: "bold", label: "Bold", desc: "Barres colorées" },
  { key: "modern", label: "Modern", desc: "Gradient subtil" },
  { key: "clean", label: "Clean", desc: "Sans branding" },
];

export default function NewVideoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [mode, setMode] = useState<SourceMode>("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>(["tiktok", "reels"]);
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>("karaoke");
  const [template, setTemplate] = useState<Template>("minimal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (s: string) => {
    try { new URL(s); return true; } catch { return false; }
  };

  const canSubmit =
    (mode === "url" && isValidUrl(url)) ||
    (mode === "upload" && !!uploadedPath && !uploading);

  const handleUploadFile = useCallback(async (f: File) => {
    setUploading(true);
    setUploadProgress(0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = f.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    // Upload vers Supabase Storage avec progression simulée
    // (Supabase JS SDK ne supporte pas encore onUploadProgress nativement)
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 5, 90));
    }, 300);

    const { error: uploadError } = await supabase.storage
      .from("source-videos")
      .upload(path, f, { upsert: false });

    clearInterval(progressInterval);

    if (uploadError) {
      setError("Échec de l'upload. Réessaie.");
      setUploading(false);
      return;
    }

    setUploadProgress(100);
    setUploadedPath(path);
    setUploading(false);
  }, [supabase]);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      handleUploadFile(accepted[0]);
    }
  }, [handleUploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".mov", ".mkv", ".webm"] },
    maxSize: 5 * 1024 * 1024 * 1024,
    multiple: false,
  });

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      const payload = {
        user_id: user.id,
        source_type: mode === "url" ? "youtube" as const : "upload" as const,
        source_url: mode === "url" ? url : undefined,
        source_path: mode === "upload" ? uploadedPath ?? undefined : undefined,
        platforms: platforms.map((p) => p),
        template,
        subtitle_style: subtitleStyle,
      };

      const { job_id } = await api.createJob(payload);

      // Invalide le cache pour rafraîchir la liste
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });

      // Redirection vers le dashboard avec le job en cours
      router.push(`/dashboard?job=${job_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du lancement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      <div>
        <h2 className="text-2xl font-serif text-[#FAF7F4]">Nouvelle vidéo</h2>
        <p className="text-sm text-[#5C5248] mt-1">
          Colle n'importe quelle URL vidéo ou upload un fichier.
        </p>
      </div>

      {/* ── Source ── */}
      <div className="space-y-4">
        <div className="flex gap-1 p-1 bg-[#171310] rounded-lg w-fit border border-[#302B27]">
          {(["url", "upload"] as SourceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150",
                mode === m
                  ? "bg-[#211D1A] text-[#FAF7F4] shadow-sm"
                  : "text-[#5C5248] hover:text-[#A8988A]"
              )}
            >
              {m === "url" ? <Link2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {m === "url" ? "Lien vidéo" : "Upload fichier"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === "url" ? (
            <motion.div
              key="url"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C5248]" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/... ou twitch.tv/... ou vimeo.com/..."
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-lg text-sm",
                    "bg-[#211D1A] border border-[#302B27]",
                    "text-[#FAF7F4] placeholder-[#5C5248]",
                    "focus:outline-none focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/15",
                    "transition-all duration-200"
                  )}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] text-[#5C5248]">Compatible avec :</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORTED_PLATFORMS.map((name) => (
                    <span key={name} className="text-[11px] px-2 py-0.5 rounded bg-[#171310] border border-[#302B27] text-[#5C5248]">
                      {name}
                    </span>
                  ))}
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#171310] border border-[#FBBF24]/20 text-[#FBBF24]/70">
                    + 1000 autres sites
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {file ? (
                <div className="space-y-3 p-4 rounded-lg bg-[#171310] border border-[#302B27]">
                  <div className="flex items-center gap-3">
                    <Film className="w-5 h-5 text-[#FBBF24] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#FAF7F4] truncate">{file.name}</p>
                      <p className="text-xs text-[#5C5248]">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                        {" · "}
                        {uploading ? "Upload en cours..." : uploadProgress === 100 ? "Upload terminé ✓" : ""}
                      </p>
                    </div>
                    {!uploading && (
                      <button
                        onClick={() => { setFile(null); setUploadProgress(0); setUploadedPath(null); }}
                        className="p-1 rounded hover:bg-[#211D1A] text-[#5C5248] hover:text-[#F87171] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {(uploading || uploadProgress > 0) && (
                    <div className="space-y-1">
                      <div className="h-1 bg-[#211D1A] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: uploadProgress === 100 ? "#4ADE80" : "#FBBF24" }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-[11px] text-[#5C5248]">
                        {uploadProgress < 100 ? `${uploadProgress}% — Ne ferme pas cette fenêtre` : "Prêt pour le traitement"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200",
                    isDragActive
                      ? "border-[#FBBF24] bg-[#FBBF24]/5"
                      : "border-[#302B27] hover:border-[#5C5248] bg-[#171310]"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#211D1A] border border-[#302B27] flex items-center justify-center">
                      <Upload className={cn("w-5 h-5", isDragActive ? "text-[#FBBF24]" : "text-[#5C5248]")} />
                    </div>
                    <div>
                      <p className="text-sm text-[#A8988A]">
                        <span className="text-[#FAF7F4] font-medium">Glisse ta vidéo ici</span>{" "}ou clique pour choisir
                      </p>
                      <p className="text-xs text-[#5C5248] mt-1">MP4 · MOV · MKV · WebM — max 5 Go</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Plateformes ── */}
      <div className="space-y-3">
        <label className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">
          Plateformes cibles
        </label>
        <div className="flex gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              onClick={() => togglePlatform(p.key)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150",
                platforms.includes(p.key)
                  ? "bg-[#FBBF24]/10 border-[#FBBF24]/40 text-[#FBBF24]"
                  : "bg-[#171310] border-[#302B27] text-[#5C5248] hover:text-[#A8988A] hover:border-[#5C5248]"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Template ── */}
      <div className="space-y-3">
        <label className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">Template</label>
        <div className="grid grid-cols-4 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              onClick={() => setTemplate(t.key)}
              className={cn(
                "p-3 rounded-lg text-left border transition-all duration-150",
                template === t.key ? "bg-[#211D1A] border-[#FBBF24]/40" : "bg-[#171310] border-[#302B27] hover:border-[#5C5248]"
              )}
            >
              <p className={cn("text-sm font-medium", template === t.key ? "text-[#FAF7F4]" : "text-[#A8988A]")}>{t.label}</p>
              <p className="text-xs text-[#5C5248] mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sous-titres ── */}
      <div className="space-y-3">
        <label className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">Style sous-titres</label>
        <div className="grid grid-cols-3 gap-2">
          {SUBTITLE_STYLES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSubtitleStyle(s.key)}
              className={cn(
                "p-3 rounded-lg text-left border transition-all duration-150",
                subtitleStyle === s.key ? "bg-[#211D1A] border-[#FBBF24]/40" : "bg-[#171310] border-[#302B27] hover:border-[#5C5248]"
              )}
            >
              <p className={cn("text-sm font-medium", subtitleStyle === s.key ? "text-[#FAF7F4]" : "text-[#A8988A]")}>{s.label}</p>
              <p className="text-xs text-[#5C5248] mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[#F87171] bg-[#2d0808] border border-[#F87171]/20 px-3 py-2 rounded-lg"
        >
          {error}
        </motion.p>
      )}

      {/* ── Submit ── */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all duration-150",
          canSubmit && !loading
            ? "bg-[#FBBF24] text-[#0C0A09] hover:bg-[#F59E0B] active:scale-[0.99]"
            : "bg-[#211D1A] text-[#5C5248] cursor-not-allowed"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Lancement en cours...
          </>
        ) : (
          <>
            Lancer le traitement
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
