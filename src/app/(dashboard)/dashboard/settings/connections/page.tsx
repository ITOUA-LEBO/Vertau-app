"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ExternalLink, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Connection = {
  provider: string;
  channel_name: string;
  channel_avatar: string | null;
  updated_at: string;
};

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

const PLATFORMS = [
  {
    key: "youtube",
    name: "YouTube",
    description: "Publie tes Shorts directement sur ta chaîne",
    color: "#FF0000",
    icon: YoutubeIcon,
    available: true,
  },
  {
    key: "tiktok",
    name: "TikTok",
    description: "Publication directe — bientôt disponible",
    color: "#010101",
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.26 8.26 0 004.83 1.56V6.79a4.85 4.85 0 01-1.06-.1z"/>
      </svg>
    ),
    available: false,
  },
  {
    key: "instagram",
    name: "Instagram Reels",
    description: "Publication directe — bientôt disponible",
    color: "#E1306C",
    icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    available: false,
  },
];

export default function ConnectionsPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");

  useEffect(() => {
    loadConnections();
  }, []);

  async function loadConnections() {
    const { data } = await supabase
      .from("oauth_connections")
      .select("provider, channel_name, channel_avatar, updated_at");
    setConnections(data ?? []);
    setLoading(false);
  }

  const handleConnect = (provider: string) => {
    if (provider === "youtube") {
      window.location.href = "/api/youtube";
    }
  };

  const handleDisconnect = async (provider: string) => {
    setDisconnecting(provider);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("oauth_connections")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", provider);
    }
    setConnections((prev) => prev.filter((c) => c.provider !== provider));
    setDisconnecting(null);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-16">
      <div>
        <h2 className="text-2xl font-serif text-[#FAF7F4]">Connexions</h2>
        <p className="text-sm text-[#5C5248] mt-1">
          Connecte tes comptes pour publier directement depuis Vertau.
        </p>
      </div>

      {/* Feedback succès / erreur */}
      {successParam === "youtube" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#052e16] border border-[#4ADE80]/20 text-sm text-[#4ADE80]"
        >
          <Check className="w-4 h-4 flex-shrink-0" />
          Compte YouTube connecté avec succès.
        </motion.div>
      )}
      {errorParam && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#2d0808] border border-[#F87171]/20 text-sm text-[#F87171]"
        >
          <X className="w-4 h-4 flex-shrink-0" />
          {errorParam === "cancelled"
            ? "Connexion annulée."
            : "Erreur lors de la connexion. Réessaie."}
        </motion.div>
      )}

      {/* Liste des plateformes */}
      <div className="space-y-3">
        {PLATFORMS.map((platform, i) => {
          const connection = connections.find((c) => c.provider === platform.key);
          const isConnected = !!connection;

          return (
            <motion.div
              key={platform.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className={cn(
                "flex items-center gap-4 p-5 rounded-xl border transition-all",
                isConnected
                  ? "bg-[#171310] border-[#4ADE80]/20"
                  : "bg-[#171310] border-[#302B27]",
                !platform.available && "opacity-50"
              )}
            >
              {/* Icône */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: platform.color + "18", border: `1px solid ${platform.color}25` }}
              >
                <platform.icon className="w-5 h-5" />
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#FAF7F4]">{platform.name}</p>
                  {isConnected && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#052e16] border border-[#4ADE80]/20 text-[#4ADE80] font-medium">
                      Connecté
                    </span>
                  )}
                  {!platform.available && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#211D1A] border border-[#302B27] text-[#5C5248]">
                      Bientôt
                    </span>
                  )}
                </div>
                {isConnected ? (
                  <p className="text-xs text-[#5C5248] truncate mt-0.5">
                    {connection.channel_name}
                  </p>
                ) : (
                  <p className="text-xs text-[#5C5248] mt-0.5">{platform.description}</p>
                )}
              </div>

              {/* Action */}
              {platform.available && (
                isConnected ? (
                  <button
                    onClick={() => handleDisconnect(platform.key)}
                    disabled={disconnecting === platform.key}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#5C5248] border border-[#302B27] hover:text-[#F87171] hover:border-[#F87171]/30 transition-all"
                  >
                    {disconnecting === platform.key ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    Déconnecter
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.key)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#FBBF24] text-[#0C0A09] hover:bg-[#F59E0B] active:scale-95 transition-all"
                  >
                    Connecter
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Note */}
      <p className="text-xs text-[#5C5248] leading-relaxed">
        Vertau ne publie jamais sans ta confirmation. Tu choisis clip par clip ce que tu publies et où.
      </p>
    </div>
  );
}
