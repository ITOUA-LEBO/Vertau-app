import Link from "next/link";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Gauche : formulaire ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 bg-[#0C0A09]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group mb-12">
          <span className="font-serif text-xl text-[#FAF7F4]">Vertau</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] group-hover:scale-125 transition-transform" />
        </Link>

        {children}

        <p className="mt-10 text-[11px] text-[#5C5248] text-center max-w-xs">
          En continuant, tu acceptes nos{" "}
          <Link href="/legal" className="underline hover:text-[#A8988A] transition-colors">
            CGU
          </Link>{" "}
          et notre{" "}
          <Link href="/privacy" className="underline hover:text-[#A8988A] transition-colors">
            politique de confidentialité
          </Link>
          .
        </p>
      </div>

      {/* ── Droite : visuel cinéma ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#0C0A09] border-l border-[#1F1B18]">
        {/* Fond radial ambre */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 60% 50%, rgba(251,191,36,0.05) 0%, transparent 70%)",
          }}
        />

        {/* Marque de coupe */}
        <div
          className="absolute top-0 left-20 w-px h-full pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(251,191,36,0.1) 30%, rgba(251,191,36,0.1) 70%, transparent 100%)",
            transform: "rotate(12deg)",
          }}
        />

        {/* Clips démo flottants */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-80 h-96">
            {[
              { score: 9, title: "La tech qui triple tes vues", rotate: "-8deg", x: "-60px", y: "20px", z: 1 },
              { score: 8, title: "Ce que personne ne dit...", rotate: "2deg", x: "0px", y: "-20px", z: 3 },
              { score: 7, title: "Résultat en 30 jours", rotate: "10deg", x: "60px", y: "30px", z: 2 },
            ].map((clip, i) => (
              <div
                key={i}
                className="absolute w-32 rounded-xl overflow-hidden border border-[#302B27] bg-[#171310] shadow-2xl"
                style={{
                  aspectRatio: "9/16",
                  transform: `rotate(${clip.rotate}) translate(${clip.x}, ${clip.y})`,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-64px",
                  marginTop: "-128px",
                  zIndex: clip.z,
                }}
              >
                {/* Fond */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(160deg, #1A1510 0%, #0C0A09 100%)" }}
                />
                {/* Ligne film */}
                <div className="absolute inset-x-0 top-0 h-px bg-[#FBBF24]/10" />
                <div className="absolute inset-x-0" style={{ bottom: "48px", height: "1px", background: "rgba(251,191,36,0.1)" }} />
                {/* Score */}
                <div
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-[#0C0A09]"
                  style={{
                    backgroundColor: clip.score >= 9 ? "#FBBF24" : clip.score >= 7 ? "#4ADE80" : "#FB923C",
                  }}
                >
                  {clip.score}
                </div>
                {/* Titre */}
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-[#0C0A09] to-transparent">
                  <p className="text-[10px] text-[#FAF7F4] font-medium leading-tight">{clip.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Texte bas gauche */}
        <div className="absolute bottom-12 left-10 space-y-2">
          <p className="font-serif text-2xl text-[#FAF7F4] italic leading-tight">
            "Tes meilleures minutes,
            <br />
            automatiquement."
          </p>
          <p className="text-xs text-[#5C5248]">
            — Vertau génère tes clips en 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
