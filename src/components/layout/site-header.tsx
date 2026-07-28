"use client";

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
      <div className="flex items-center justify-end gap-3 px-4 py-2 pl-14 sm:px-6 lg:pl-6">
        <RankingModeSwitcher />
      </div>
    </header>
  );
}
