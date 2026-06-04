"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Video,
  Grid3X3,
  Palette,
  Settings,
  CreditCard,
  LogOut,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/new", icon: Video, label: "Nouvelle vidéo" },
  { href: "/dashboard/clips", icon: Grid3X3, label: "Mes clips" },
  { href: "/dashboard/settings/brand", icon: Palette, label: "Branding" },
];

const BOTTOM_NAV = [
  { href: "/dashboard/settings/connections", icon: Link2, label: "Connexions" },
  { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
  { href: "/dashboard/settings/billing", icon: CreditCard, label: "Abonnement" },
];

const PLAN_MINUTES: Record<string, number> = {
  free: 30,
  creator: 150,
  pro: 600,
  agency: 2000,
};

export function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data as UserProfile);
    }
    loadProfile();
  }, [supabase]);

  const minutesTotal = profile ? (PLAN_MINUTES[profile.plan] ?? 30) : 30;
  const minutesUsed = profile?.minutesUsed ?? 0;
  const pct = Math.min(Math.round((minutesUsed / minutesTotal) * 100), 100);
  const quotaColor = pct >= 90 ? "#F87171" : pct >= 70 ? "#FB923C" : "#FBBF24";

  const displayName = profile?.name ?? profile?.email?.split("@")[0] ?? "…";
  const displayEmail = profile?.email ?? "";
  const planLabel = profile?.plan
    ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)
    : "Free";
  const initials = displayName[0]?.toUpperCase() ?? "?";

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-[#302B27] bg-[#0C0A09]">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[#1F1B18]">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-lg text-[#FAF7F4]">Vertau</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] group-hover:scale-125 transition-transform" />
        </Link>
      </div>

      {/* Nav principale */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-[#211D1A] text-[#FAF7F4] border-l-2 border-[#FBBF24] pl-[10px]"
                  : "text-[#A8988A] hover:text-[#FAF7F4] hover:bg-[#171310]"
              )}
            >
              <item.icon
                className={cn("w-4 h-4", active ? "text-[#FBBF24]" : "")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Nav secondaire */}
      <div className="px-3 space-y-0.5 pb-2">
        {BOTTOM_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-[#211D1A] text-[#FAF7F4]"
                  : "text-[#A8988A] hover:text-[#FAF7F4] hover:bg-[#171310]"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Quota + user */}
      <div className="p-4 border-t border-[#1F1B18] space-y-4">
        {/* Quota bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C5248]">Minutes ce mois</span>
            <span className="text-xs text-[#A8988A]">
              {Math.round(minutesUsed)} / {minutesTotal}
            </span>
          </div>
          <div className="h-1 bg-[#211D1A] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: quotaColor }}
            />
          </div>
          <p className="text-[11px] text-[#5C5248]">
            {minutesTotal - Math.round(minutesUsed)} min restantes
          </p>
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FBBF24]/20 border border-[#FBBF24]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-[#FBBF24]">
              {initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#FAF7F4] truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-[#5C5248] truncate">
              {displayEmail}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FBBF24]/10 text-[#FBBF24] font-medium border border-[#FBBF24]/20">
              {planLabel}
            </span>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                title="Se déconnecter"
                className="p-1 rounded text-[#5C5248] hover:text-[#F87171] hover:bg-[#211D1A] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
