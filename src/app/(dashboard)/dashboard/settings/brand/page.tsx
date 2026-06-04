"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, X, Check, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const PRESET_COLORS = [
  "#FBBF24", "#3B82F6", "#10B981", "#EF4444",
  "#8B5CF6", "#F97316", "#EC4899", "#FAF7F4",
];

const FONT_OPTIONS = [
  { key: "inter", label: "Inter", preview: "Aa" },
  { key: "sora", label: "Sora", preview: "Aa" },
  { key: "space-grotesk", label: "Space Grotesk", preview: "Aa" },
  { key: "instrument-serif", label: "Instrument Serif", preview: "Aa" },
];

const SUBTITLE_STYLES = [
  {
    key: "karaoke",
    label: "Karaoké",
    desc: "Chaque mot s'allume au rythme de la voix",
    preview: (color: string) => (
      <div className="flex gap-1 text-[10px] font-semibold">
        <span className="text-[#5C5248]">Tu</span>
        <span className="text-[#5C5248]">dois</span>
        <span style={{ color }}>voir</span>
        <span className="text-[#5C5248]">ça</span>
      </div>
    ),
  },
  {
    key: "highlight",
    label: "Highlight",
    desc: "Le mot actif ressort en couleur",
    preview: (color: string) => (
      <p className="text-[10px] font-semibold text-white">
        Tu dois{" "}
        <span className="px-0.5 rounded" style={{ backgroundColor: color + "30", color }}>
          voir
        </span>{" "}
        ça
      </p>
    ),
  },
  {
    key: "impact",
    label: "Impact",
    desc: "Gros titres en majuscules, style viral",
    preview: () => (
      <p className="text-[11px] font-black text-white uppercase tracking-wide">
        TU DOIS VOIR ÇA
      </p>
    ),
  },
];

export default function BrandPage() {
  const supabase = createClient();

  const [color, setColor] = useState("#FBBF24");
  const [customColor, setCustomColor] = useState("");
  const [font, setFont] = useState("inter");
  const [subtitleStyle, setSubtitleStyle] = useState("karaoke");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Charger le profil existant
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("brand_color, brand_logo_url, subtitle_style").eq("id", user.id).single();
      if (data) {
        if (data.brand_color) setColor(data.brand_color);
        if (data.brand_logo_url) setLogoUrl(data.brand_logo_url);
        if (data.subtitle_style) setSubtitleStyle(data.subtitle_style);
      }
    }
    load();
  }, [supabase]);

  const onDropLogo = useCallback(async (accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = f.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;
    const { error } = await supabase.storage.from("brand-assets").upload(path, f, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("brand-assets").getPublicUrl(path);
      setLogoUrl(publicUrl);
    }
    setUploading(false);
  }, [supabase]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { "image/*": [".png", ".jpg", ".svg", ".webp"] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from("profiles").update({
      brand_color: color,
      brand_logo_url: logoUrl,
      subtitle_style: subtitleStyle,
    }).eq("id", user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const activeColor = customColor || color;

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-16">
      <div>
        <h2 className="text-2xl font-serif text-[#FAF7F4]">Branding</h2>
        <p className="text-sm text-[#5C5248] mt-1">
          Personnalise l'apparence de tes clips exportés.
        </p>
      </div>

      {/* ── Logo ── */}
      <section className="space-y-4">
        <h3 className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">Logo</h3>
        {logoUrl ? (
          <div className="flex items-center gap-4 p-4 rounded-lg bg-[#171310] border border-[#302B27]">
            <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#FAF7F4]">Logo chargé</p>
              <p className="text-xs text-[#5C5248]">Affiché en bas à droite de tes clips</p>
            </div>
            <button
              onClick={() => setLogoUrl(null)}
              className="p-1.5 rounded hover:bg-[#211D1A] text-[#5C5248] hover:text-[#F87171] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              isDragActive ? "border-[#FBBF24] bg-[#FBBF24]/5" : "border-[#302B27] hover:border-[#5C5248] bg-[#171310]"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-[#FBBF24] animate-spin" />
              ) : (
                <Upload className={cn("w-6 h-6", isDragActive ? "text-[#FBBF24]" : "text-[#5C5248]")} />
              )}
              <div>
                <p className="text-sm text-[#A8988A]">
                  <span className="text-[#FAF7F4] font-medium">Glisse ton logo</span> ou clique
                </p>
                <p className="text-xs text-[#5C5248] mt-0.5">PNG · JPG · SVG · max 5 Mo</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Couleur ── */}
      <section className="space-y-4">
        <h3 className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">Couleur principale</h3>
        <div className="flex flex-wrap gap-3 items-center">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setCustomColor(""); }}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all duration-150",
                color === c && !customColor ? "border-[#FAF7F4] scale-110" : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
          {/* Couleur custom */}
          <div className="relative flex items-center gap-2">
            <input
              type="color"
              value={customColor || color}
              onChange={(e) => { setCustomColor(e.target.value); setColor(e.target.value); }}
              className="w-8 h-8 rounded-full cursor-pointer border-2 border-[#302B27] bg-transparent"
            />
            <span className="text-xs text-[#5C5248] font-mono">{activeColor.toUpperCase()}</span>
          </div>
        </div>
      </section>

      {/* ── Style sous-titres ── */}
      <section className="space-y-4">
        <h3 className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">Style sous-titres</h3>
        <div className="grid grid-cols-3 gap-3">
          {SUBTITLE_STYLES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSubtitleStyle(s.key)}
              className={cn(
                "p-4 rounded-xl border text-left space-y-3 transition-all duration-150",
                subtitleStyle === s.key
                  ? "bg-[#211D1A] border-[#FBBF24]/40"
                  : "bg-[#171310] border-[#302B27] hover:border-[#5C5248]"
              )}
            >
              {/* Preview mini */}
              <div className="h-8 flex items-center">
                {s.preview(activeColor)}
              </div>
              <div>
                <p className={cn("text-sm font-semibold", subtitleStyle === s.key ? "text-[#FAF7F4]" : "text-[#A8988A]")}>
                  {s.label}
                </p>
                <p className="text-[11px] text-[#5C5248] mt-0.5">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── Aperçu clip ── */}
      <section className="space-y-4">
        <h3 className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">Aperçu</h3>
        <div className="flex gap-6 items-start">
          {/* Clip mock */}
          <div
            className="relative rounded-xl overflow-hidden border border-[#302B27] flex-shrink-0"
            style={{ width: 120, aspectRatio: "9/16", background: "#0C0A09" }}
          >
            <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1A1510 0%, #0C0A09 100%)" }} />
            {/* Barre couleur haut */}
            <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: activeColor }} />
            {/* Play */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: activeColor + "20", border: `1px solid ${activeColor}40` }}>
                <Play className="w-4 h-4 ml-0.5" style={{ color: activeColor }} fill={activeColor} />
              </div>
            </div>
            {/* Sous-titres simulés */}
            <div className="absolute bottom-6 inset-x-2 text-center">
              {SUBTITLE_STYLES.find((s) => s.key === subtitleStyle)?.preview(activeColor)}
            </div>
            {/* Logo */}
            {logoUrl && (
              <img src={logoUrl} alt="" className="absolute bottom-1 right-1 w-6 h-6 object-contain opacity-80" />
            )}
            {/* Barre couleur bas */}
            <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: activeColor }} />
          </div>

          <div className="space-y-3 text-sm text-[#A8988A]">
            <p className="text-[#FAF7F4] font-medium">Ce que tu vois ici</p>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: activeColor }} />
                Couleur appliquée sur les sous-titres et barres
              </li>
              {logoUrl && (
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] flex-shrink-0" />
                  Logo positionné en bas à droite
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#A8988A] flex-shrink-0" />
                Style sous-titres : {SUBTITLE_STYLES.find((s) => s.key === subtitleStyle)?.label}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Save ── */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#FBBF24] text-[#0C0A09] text-sm font-semibold hover:bg-[#F59E0B] active:scale-95 transition-all disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <><Check className="w-4 h-4" /> Enregistré</>
        ) : (
          "Enregistrer le branding"
        )}
      </button>
    </div>
  );
}
