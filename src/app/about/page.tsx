import { AboutSectionNav } from "@/components/about/about-section-nav";
import { AboutTopic } from "@/components/about/about-topic";
import { getTranslations } from "next-intl/server";

const FIFA_RANKING_METHODOLOGY_URL =
  "https://digitalhub.fifa.com/m/f99da4f73212220/original/edbm045h0udbwkqew35a-pdf.pdf";
const CONTACT_EMAIL = "dev@carlosrdgz.space";
const REPO_URL = "https://github.com/GralPaprika/cup-path";

const SECTION_SCROLL_MT =
  "scroll-mt-[calc(var(--site-header-height)+1rem)]";

export default async function AboutPage() {
  const t = await getTranslations("about");

  const navGroups = [
    { id: "origin", label: t("groupOrigin") },
    { id: "methodology", label: t("groupMethodology") },
    { id: "features", label: t("groupFeatures") },
    { id: "data", label: t("groupData") },
    { id: "contact", label: t("groupContact") },
  ];

  const originTopics = [{ title: t("whyTitle"), body: t("whyBody") }];

  const methodologyTopics = [
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
  ];

  const featureTopics = [
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
  ];

  const dataTopics = [
    { title: t("rankingModesTitle"), body: t("rankingModesBody") },
    { title: t("dataTitle"), body: t("dataBody") },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <AboutSectionNav
          ariaLabel={t("sectionNavLabel")}
          groups={navGroups}
        />

        <div className="space-y-6">
          <section
            id="origin"
            className={`${SECTION_SCROLL_MT} glass-panel space-y-6 p-5 sm:p-6`}
          >
            <h2 className="text-lg font-semibold text-white">
              {t("groupOrigin")}
            </h2>
            <div>
              {originTopics.map((topic) => (
                <AboutTopic key={topic.title} {...topic} />
              ))}
            </div>
          </section>

          <section
            id="methodology"
            className={`${SECTION_SCROLL_MT} glass-panel space-y-6 p-5 sm:p-6`}
          >
            <h2 className="text-lg font-semibold text-white">
              {t("groupMethodology")}
            </h2>
            <div>
              {methodologyTopics.map((topic) => (
                <AboutTopic key={topic.title} {...topic} />
              ))}
            </div>
          </section>

          <section
            id="features"
            className={`${SECTION_SCROLL_MT} glass-panel space-y-6 p-5 sm:p-6`}
          >
            <h2 className="text-lg font-semibold text-white">
              {t("groupFeatures")}
            </h2>
            <div>
              {featureTopics.map((topic) => (
                <AboutTopic key={topic.title} {...topic} />
              ))}
            </div>
          </section>

          <section
            id="data"
            className={`${SECTION_SCROLL_MT} glass-panel space-y-6 p-5 sm:p-6`}
          >
            <h2 className="text-lg font-semibold text-white">
              {t("groupData")}
            </h2>
            <div>
              {dataTopics.map((topic) => (
                <AboutTopic key={topic.title} {...topic} />
              ))}
            </div>
          </section>

          <section
            id="contact"
            className={`${SECTION_SCROLL_MT} glass-panel space-y-6 p-5 sm:p-6`}
          >
            <h2 className="text-lg font-semibold text-white">
              {t("groupContact")}
            </h2>
            <div className="space-y-4 leading-7 text-muted-foreground">
              <p>{t("contactBody")}</p>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-white/70">
                    {t("contactEmailLabel")}
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-wc-sky hover:underline"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-white/70">
                    {t("contactRepoLabel")}
                  </dt>
                  <dd>
                    <a
                      href={REPO_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-wc-sky hover:underline"
                    >
                      {t("contactRepoLink")}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
