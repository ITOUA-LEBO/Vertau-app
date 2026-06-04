"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/new": "Nouvelle vidéo",
  "/dashboard/clips": "Mes clips",
  "/dashboard/settings/brand": "Branding",
  "/dashboard/settings/billing": "Abonnement",
  "/dashboard/settings": "Paramètres",
};

export function Header() {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Dashboard";
  const showNewButton = pathname === "/dashboard" || pathname === "/dashboard/clips";

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-[#1F1B18] bg-[#0C0A09] flex-shrink-0">
      <h1 className="text-sm font-semibold text-[#FAF7F4]">{title}</h1>

      {showNewButton && (
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FBBF24] text-[#0C0A09] text-sm font-semibold hover:bg-[#F59E0B] active:scale-95 transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Nouvelle vidéo
        </Link>
      )}
    </header>
  );
}
