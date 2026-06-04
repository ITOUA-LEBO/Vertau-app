import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#1F1B18] py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg text-[#FAF7F4]">Vertau</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
          <span className="text-sm text-[#5C5248]">
            Tes meilleures minutes, automatiquement.
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-[#5C5248]">
          <Link href="/legal" className="hover:text-[#A8988A] transition-colors">
            CGU
          </Link>
          <Link href="/privacy" className="hover:text-[#A8988A] transition-colors">
            Confidentialité
          </Link>
          <span>© 2026 Vertau</span>
        </div>
      </div>
    </footer>
  );
}
