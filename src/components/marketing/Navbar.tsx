"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0C0A09]/90 backdrop-blur-md border-b border-[#302B27]"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-xl text-[#FAF7F4] tracking-tight">
            Vertau
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24] group-hover:scale-125 transition-transform" />
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="#how"
            className="text-sm text-[#A8988A] hover:text-[#FAF7F4] transition-colors"
          >
            Comment ça marche
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-[#A8988A] hover:text-[#FAF7F4] transition-colors"
          >
            Tarifs
          </Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-[#A8988A] hover:text-[#FAF7F4] transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#FBBF24] text-[#0C0A09] text-sm font-semibold hover:bg-[#F59E0B] transition-colors"
          >
            Essayer gratuitement
            <span className="text-[#0C0A09]/60">→</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
