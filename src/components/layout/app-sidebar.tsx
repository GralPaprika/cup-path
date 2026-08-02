"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  ChartColumn,
  GitCompareArrows,
  HelpCircle,
  LayoutGrid,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { NAV_LINKS, type NavLinkKey } from "@/components/layout/nav-links";
import { RankingModeSwitcher } from "@/components/layout/ranking-mode-switcher";
import { useSidebarCollapse } from "@/components/layout/sidebar-collapse-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<NavLinkKey, typeof Route> = {
  teamAnalysis: Route,
  overview: ChartColumn,
  groups: LayoutGrid,
  compare: GitCompareArrows,
  simulate: Sparkles,
  about: HelpCircle,
};

function NavItems({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="flex flex-col gap-1" aria-label={t("primary")}>
      {NAV_LINKS.map((link) => {
        const active = pathname === link.href;
        const Icon = NAV_ICONS[link.key];
        const label = t(link.key);

        return (
          <Link
            key={link.href}
            href={link.href}
            title={collapsed ? label : undefined}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              collapsed && "justify-center px-2",
              active
                ? "bg-wc-sky/15 text-wc-sky shadow-sm shadow-wc-sky/10"
                : "text-muted-foreground hover:bg-white/6 hover:text-white",
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                active
                  ? "text-wc-sky"
                  : "text-muted-foreground group-hover:text-white",
              )}
            />
            {!collapsed && <span className="truncate">{label}</span>}
            {collapsed && <span className="sr-only">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  const t = useTranslations("nav");
  const { setCollapsed } = useSidebarCollapse();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1 border-b border-white/6 px-3 py-1",
        collapsed && "flex-col gap-2 px-2 py-1.5",
      )}
    >
      <Link
        href="/"
        aria-label="CupPath"
        className={cn("group min-w-0", collapsed ? "shrink-0" : "flex-1")}
      >
        {collapsed ? (
          <Image
            src="/brand/cuppath-mark.svg"
            alt="CupPath"
            width={40}
            height={40}
            className="size-9"
            priority
          />
        ) : (
          <Image
            src="/brand/cuppath-lockup.svg"
            alt="CupPath"
            width={225}
            height={60}
            className="h-auto max-h-14 w-auto max-w-full"
            priority
          />
        )}
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setCollapsed((current) => !current)}
        aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        title={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        className="shrink-0 text-muted-foreground hover:text-white"
      >
        {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>
    </div>
  );
}

export function AppSidebar() {
  const t = useTranslations("nav");
  const app = useTranslations("app");
  const { collapsed } = useSidebarCollapse();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState(pathname);

  if (menuPath !== pathname) {
    setMenuPath(pathname);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/8 bg-wc-navy/80 backdrop-blur-xl transition-[width] duration-200 lg:flex",
          collapsed
            ? "w-[var(--shell-sidebar-collapsed)]"
            : "w-[var(--shell-sidebar-expanded)]",
        )}
        aria-label={t("primary")}
      >
        <SidebarBrand collapsed={collapsed} />
        <div className="scrollbar-subtle flex-1 overflow-y-auto p-2">
          <NavItems collapsed={collapsed} />
        </div>
        <div
          className={cn(
            "flex shrink-0 flex-col gap-3 border-t border-white/6 p-3",
            collapsed && "px-2",
          )}
        >
          <RankingModeSwitcher collapsed={collapsed} />
          <LocaleSwitcher collapsed={collapsed} />
        </div>
      </aside>

      <div className="lg:hidden">
        <header className="fixed inset-x-0 top-0 z-40 flex h-12 items-center gap-2 border-b border-white/8 bg-wc-navy/90 px-3 backdrop-blur-xl">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:text-white"
            onClick={() => setMobileOpen(true)}
            aria-label={t("openMenu")}
          >
            <Menu />
          </Button>
          <Link href="/" aria-label="CupPath" className="min-w-0">
            <Image
              src="/brand/cuppath-lockup.svg"
              alt="CupPath"
              width={225}
              height={60}
              className="h-7 w-auto"
              priority
            />
          </Link>
        </header>

        <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
            <DialogPrimitive.Popup className="fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col border-r border-white/10 bg-wc-navy/95 shadow-2xl outline-none backdrop-blur-xl transition-transform data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full">
              <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-4">
                <DialogPrimitive.Title className="sr-only">
                  {app("name")}
                </DialogPrimitive.Title>
                <Link
                  href="/"
                  aria-label="CupPath"
                  onClick={() => setMobileOpen(false)}
                  className="min-w-0"
                >
                  <Image
                    src="/brand/cuppath-lockup.svg"
                    alt="CupPath"
                    width={225}
                    height={60}
                    className="h-10 w-auto"
                  />
                </Link>
                <DialogPrimitive.Close
                  className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/8 hover:text-white"
                  aria-label={t("closeMenu")}
                >
                  <X className="size-4" />
                </DialogPrimitive.Close>
              </div>
              <div className="scrollbar-subtle flex-1 overflow-y-auto px-3 py-3">
                <NavItems onNavigate={() => setMobileOpen(false)} />
              </div>
              <div className="flex shrink-0 flex-col gap-3 border-t border-white/6 p-3">
                <RankingModeSwitcher />
                <LocaleSwitcher />
              </div>
            </DialogPrimitive.Popup>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </>
  );
}
