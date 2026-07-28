import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Geist_Mono } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import { RankingModeProvider } from "@/components/layout/ranking-mode-provider";
import { SidebarCollapseProvider } from "@/components/layout/sidebar-collapse-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { RANKING_MODE_COOKIE } from "@/lib/client/ranking-mode-preference";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app");

  return {
    title: t("name"),
    description: t("tagline"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();
  const cookieStore = await cookies();
  const initialMode = parseRankingMode(
    cookieStore.get(RANKING_MODE_COOKIE)?.value ?? null,
  );

  return (
    <html
      lang={locale}
      className={`${plusJakarta.variable} ${geistMono.variable} dark h-full`}
    >
      <body
        className="min-h-full bg-background font-sans text-foreground antialiased"
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RankingModeProvider initialMode={initialMode}>
            <SidebarCollapseProvider>
              <div className="relative flex min-h-screen">
                <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 wc-mesh-bg" />
                <AppSidebar />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-200 lg:pl-[var(--shell-sidebar-width)]">
                  <SiteHeader />
                  <main className="min-w-0 flex-1">{children}</main>
                </div>
              </div>
            </SidebarCollapseProvider>
          </RankingModeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
