import type { Metadata } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Geist_Mono } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import { RankingModeProvider } from "@/components/layout/ranking-mode-provider";
import { SiteHeader } from "@/components/layout/site-header";
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

  return (
    <html
      lang={locale}
      className={`${plusJakarta.variable} ${geistMono.variable} dark h-full`}
    >
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Suspense fallback={null}>
            <RankingModeProvider>
              <div className="relative flex min-h-screen flex-col">
                <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 wc-mesh-bg" />
                <SiteHeader />
                <main className="flex-1">{children}</main>
              </div>
            </RankingModeProvider>
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
