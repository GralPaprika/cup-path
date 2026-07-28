"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { RankingModeSwitcher } from "@/components/layout/ranking-mode-switcher";

export function SiteHeader() {
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
      <div className="flex items-center justify-between gap-3 px-4 py-0.5 pl-14 sm:px-6 sm:py-1 lg:pl-6">
        <Link href="/" aria-label="CupPath" className="group min-w-0 shrink">
          <img
            src="/brand/cuppath-lockup.svg"
            alt="CupPath"
            width={225}
            height={60}
            className="h-14 w-auto sm:h-16"
          />
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <RankingModeSwitcher />
        </div>
      </div>
    </header>
  );
}
