"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCALE_COOKIE } from "@/i18n/constants";
import type { AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const LOCALES: AppLocale[] = ["es", "en"];

export function LocaleSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const t = useTranslations("common");
  const nav = useTranslations("nav");

  const labels: Record<AppLocale, string> = {
    es: t("localeEs"),
    en: t("localeEn"),
  };

  function switchLocale(nextLocale: AppLocale) {
    if (nextLocale === locale) return;

    document.cookie = `${LOCALE_COOKIE}=${nextLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className={cn("flex flex-col gap-1.5", collapsed && "items-center")}>
      {!collapsed && (
        <span className="px-0.5 text-[11px] font-medium tracking-wide text-muted-foreground">
          {nav("language")}
        </span>
      )}
      <Select
        value={locale}
        onValueChange={(value) => {
          if (value) switchLocale(value as AppLocale);
        }}
      >
        <SelectTrigger
          size="sm"
          aria-label={nav("language")}
          title={collapsed ? nav("language") : undefined}
          className={cn(
            "h-9 border-white/15 bg-white/5 text-sm font-medium text-white shadow-none hover:bg-white/10 focus-visible:border-wc-sky/40 focus-visible:ring-wc-sky/20 data-placeholder:text-white/70 [&_svg]:text-white/70",
            collapsed ? "w-full justify-center px-1.5 uppercase" : "w-full",
          )}
        >
          <SelectValue>
            {collapsed ? locale.toUpperCase() : labels[locale]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          align={collapsed ? "center" : "start"}
          side="top"
          className="min-w-36"
        >
          {LOCALES.map((value) => (
            <SelectItem key={value} value={value} className="text-sm">
              {labels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
