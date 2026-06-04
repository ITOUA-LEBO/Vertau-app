"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("name, email").eq("id", user.id).single();
      if (data) {
        setName(data.name ?? "");
        setEmail(data.email ?? user.email ?? "");
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    await supabase.from("profiles").update({ name }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== "SUPPRIMER") return;
    setDeleting(true);
    // TODO : appel Edge Function pour supprimer le compte + données
    alert("Suppression de compte à connecter via Edge Function Supabase.");
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 text-[#5C5248] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-10 pb-16">
      <div>
        <h2 className="text-2xl font-serif text-[#FAF7F4]">Paramètres</h2>
        <p className="text-sm text-[#5C5248] mt-1">Gère ton profil et ton compte.</p>
      </div>

      {/* ── Profil ── */}
      <section className="space-y-5">
        <h3 className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">Profil</h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-[#A8988A] font-medium">Nom d'affichage</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton prénom"
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-[#211D1A] border border-[#302B27] text-[#FAF7F4] placeholder-[#5C5248] focus:outline-none focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/15 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#A8988A] font-medium">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2.5 rounded-lg text-sm bg-[#171310] border border-[#1F1B18] text-[#5C5248] cursor-not-allowed"
            />
            <p className="text-[11px] text-[#5C5248]">L'email ne peut pas être modifié ici.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FBBF24] text-[#0C0A09] text-sm font-semibold hover:bg-[#F59E0B] active:scale-95 transition-all disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <><Check className="w-4 h-4" /> Enregistré</>
          ) : (
            "Enregistrer"
          )}
        </button>
      </section>

      {/* ── Mot de passe ── */}
      <section className="space-y-4">
        <h3 className="text-xs text-[#5C5248] uppercase tracking-widest font-medium">Sécurité</h3>
        <button
          onClick={async () => {
            await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${location.origin}/auth/callback?next=/dashboard/settings`,
            });
            alert("Email de réinitialisation envoyé.");
          }}
          className="px-5 py-2.5 rounded-lg bg-[#171310] border border-[#302B27] text-sm text-[#A8988A] hover:border-[#5C5248] hover:text-[#FAF7F4] transition-all"
        >
          Changer le mot de passe
        </button>
      </section>

      {/* ── Danger zone ── */}
      <section className="space-y-4 p-5 rounded-xl border border-[#F87171]/20 bg-[#2d0808]/30">
        <h3 className="text-xs text-[#F87171] uppercase tracking-widest font-medium">Zone dangereuse</h3>
        <p className="text-sm text-[#A8988A]">
          La suppression de compte est irréversible. Toutes tes données et clips seront supprimés.
        </p>
        <div className="space-y-2">
          <label className="text-xs text-[#A8988A]">
            Tape <span className="font-mono text-[#F87171]">SUPPRIMER</span> pour confirmer
          </label>
          <input
            type="text"
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            placeholder="SUPPRIMER"
            className="w-full px-3 py-2.5 rounded-lg text-sm bg-[#211D1A] border border-[#302B27] text-[#FAF7F4] placeholder-[#5C5248] focus:outline-none focus:border-[#F87171] transition-all font-mono"
          />
        </div>
        <button
          onClick={handleDeleteAccount}
          disabled={confirmDelete !== "SUPPRIMER" || deleting}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
            confirmDelete === "SUPPRIMER"
              ? "bg-[#F87171] text-white hover:bg-[#EF4444] active:scale-95"
              : "bg-[#211D1A] text-[#5C5248] cursor-not-allowed"
          )}
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer mon compte"}
        </button>
      </section>
    </div>
  );
}
