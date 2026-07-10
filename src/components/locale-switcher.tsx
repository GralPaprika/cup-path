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

const LOCALES: AppLocale[] = ["es", "en"];

export function LocaleSwitcher() {
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
    <Select
      value={locale}
      onValueChange={(value) => {
        if (value) switchLocale(value as AppLocale);
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label={nav("language")}
        className="h-8 min-w-14 border-white/15 bg-white/5 px-2 text-[11px] font-semibold uppercase tracking-wide text-white shadow-none hover:bg-white/10 focus-visible:border-wc-sky/40 focus-visible:ring-wc-sky/20 data-placeholder:text-white/70 [&_svg]:text-white/70"
      >
        <SelectValue>{locale.toUpperCase()}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-36">
        {LOCALES.map((value) => (
          <SelectItem key={value} value={value} className="text-sm">
            {labels[value]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
