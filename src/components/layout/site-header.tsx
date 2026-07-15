"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { RankingModeSwitcher } from "@/components/layout/ranking-mode-switcher";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", key: "home" as const },
  { href: "/team-analysis", key: "teamAnalysis" as const },
  { href: "/groups", key: "groups" as const },
  { href: "/compare", key: "compare" as const },
  { href: "/simulate", key: "simulate" as const },
  { href: "/about", key: "about" as const },
];

export function SiteHeader() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const app = useTranslations("app");
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${header.offsetHeight}px`,
      );
    };

    syncHeaderHeight();
    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-white/8 bg-wc-navy/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-wc-green via-wc-sky to-wc-purple text-lg shadow-lg shadow-wc-purple/20">
            ⚽
          </span>
          <div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-wc-sky transition-colors">
              {app("name")}
            </span>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              {app("tagline")}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/5 p-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                  pathname === link.href
                    ? "bg-white/12 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-white/6 hover:text-white",
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <RankingModeSwitcher />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
