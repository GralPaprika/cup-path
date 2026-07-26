"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { RankingModeSwitcher } from "@/components/layout/ranking-mode-switcher";

export function SiteHeader() {
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
      <div className="flex items-center justify-between gap-3 px-4 py-3 pl-14 sm:px-6 lg:pl-6">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-wc-green via-wc-sky to-wc-purple text-base shadow-lg shadow-wc-purple/20 sm:size-10 sm:text-lg">
            ⚽
          </span>
          <div className="min-w-0">
            <span className="block truncate text-base font-bold tracking-tight text-white transition-colors group-hover:text-wc-sky sm:text-lg">
              {app("name")}
            </span>
            <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
              {app("tagline")}
            </p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <RankingModeSwitcher />
        </div>
      </div>
    </header>
  );
}
