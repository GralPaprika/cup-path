"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", key: "home" as const },
  { href: "/compare", key: "compare" as const },
  { href: "/about", key: "about" as const },
];

export function SiteHeader() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const app = useTranslations("app");

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-900/10 bg-emerald-950 text-white shadow-lg shadow-emerald-950/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="group inline-flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-amber-400 text-lg font-bold text-emerald-950">
              CP
            </span>
            <div>
              <span className="text-xl font-bold tracking-tight group-hover:text-emerald-100">
                {app("name")}
              </span>
              <p className="text-xs text-emerald-200/80">{app("tagline")}</p>
            </div>
          </Link>
        </div>
        <nav className="flex flex-wrap gap-1 rounded-xl bg-emerald-900/50 p-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                pathname === link.href
                  ? "bg-white text-emerald-950 shadow-sm"
                  : "text-emerald-100 hover:bg-emerald-800/60 hover:text-white",
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
