import Link from "next/link";
import { getTranslations } from "next-intl/server";

const FIFA_RANKING_METHODOLOGY_URL =
  "https://digitalhub.fifa.com/m/f99da4f73212220/original/edbm045h0udbwkqew35a-pdf.pdf";

export default async function AboutPage() {
  const t = await getTranslations("about");

  const sections: Array<{
    title: string;
    body: string;
    openHref?: string;
    openLabel?: string;
    source?: { href: string; label: string };
  }> = [
    { title: t("whyTitle"), body: t("whyBody") },
    {
      title: t("metricTitle"),
      body: t("metricBody"),
      source: {
        href: FIFA_RANKING_METHODOLOGY_URL,
        label: t("metricSource"),
      },
    },
    { title: t("methodologyTitle"), body: t("methodologyBody") },
    { title: t("pointsVsRankTitle"), body: t("pointsVsRankBody") },
    { title: t("comparisonTitle"), body: t("comparisonBody") },
    { title: t("pointsGapTitle"), body: t("pointsGapBody") },
    { title: t("rankGapTitle"), body: t("rankGapBody") },
    {
      title: t("overviewTitle"),
      body: t("overviewBody"),
      openHref: "/overview",
      openLabel: t("overviewOpen"),
    },
    {
      title: t("advancedStatsTitle"),
      body: t("advancedStatsBody"),
      openHref: "/",
      openLabel: t("teamPathOpen"),
    },
    {
      title: t("headToHeadTitle"),
      body: t("headToHeadBody"),
      openHref: "/compare",
      openLabel: t("compareOpen"),
    },
    {
      title: t("groupsTitle"),
      body: t("groupsBody"),
      openHref: "/groups",
      openLabel: t("groupsOpen"),
    },
    { title: t("stagesTitle"), body: t("stagesBody") },
    {
      title: t("simulationTitle"),
      body: t("simulationBody"),
      openHref: "/simulate",
      openLabel: t("simulateOpen"),
    },
    { title: t("rankingModesTitle"), body: t("rankingModesBody") },
    { title: t("dataTitle"), body: t("dataBody") },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-8 sm:px-6">
      <section className="glass-panel p-6">
        <h1 className="text-3xl font-bold text-white">{t("title")}</h1>
      </section>
      {sections.map((section) => (
        <section
          key={section.title}
          className="glass-panel overflow-hidden"
        >
          <div className="border-b border-white/8 bg-white/[0.03] px-5 py-4">
            <h2 className="text-lg font-semibold text-wc-sky">{section.title}</h2>
          </div>
          <div className="space-y-4 px-5 py-5 leading-7 text-muted-foreground">
            {section.body.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {section.openHref && section.openLabel && (
              <p>
                <Link
                  href={section.openHref}
                  className="text-wc-sky hover:underline"
                >
                  {section.openLabel}
                </Link>
              </p>
            )}
            {section.source && (
              <p>
                <a
                  href={section.source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-wc-sky hover:underline"
                >
                  {section.source.label}
                </a>
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
