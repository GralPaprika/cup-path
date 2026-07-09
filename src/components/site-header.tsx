"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";
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
    <header className="sticky top-0 z-50 border-b border-hermes-600/20 bg-hermes-500 text-white shadow-lg shadow-hermes-900/15">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="group inline-flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-pitch-500 text-lg font-bold text-white shadow-sm">
              CP
            </span>
            <div>
              <span className="text-xl font-bold tracking-tight group-hover:text-hermes-50">
                {app("name")}
              </span>
              <p className="text-xs text-hermes-100/80">{app("tagline")}</p>
            </div>
          </Link>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <nav className="flex flex-wrap gap-1 rounded-xl bg-hermes-600/40 p-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  pathname === link.href
                    ? "bg-white text-hermes-600 shadow-sm"
                    : "text-hermes-50 hover:bg-hermes-600/70 hover:text-white",
                )}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
