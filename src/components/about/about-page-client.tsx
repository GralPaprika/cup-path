"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChartColumn,
  GitCompareArrows,
  LayoutGrid,
  ListFilter,
  Route,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { AboutDetailDialog } from "@/components/about/about-detail-dialog";
import { AboutFeatureCard } from "@/components/about/about-feature-card";
import { Button } from "@/components/ui/button";

const FIFA_RANKING_METHODOLOGY_URL =
  "https://digitalhub.fifa.com/m/f99da4f73212220/original/edbm045h0udbwkqew35a-pdf.pdf";
const OPENFOOTBALL_WORLDCUP_JSON_URL =
  "https://github.com/openfootball/worldcup.json";
const RAPIDAPI_WORLD_FOOTBALL_RANKING_URL =
  "https://rapidapi.com/sharmadhirajnp2/api/world-football-ranking";
const CONTACT_EMAIL = "dev@carlosrdgz.space";
const REPO_URL = "https://github.com/GralPaprika/cup-path";
const REPO_NAME = "GralPaprika/cup-path";
const LINKEDIN_URL = "https://www.linkedin.com/in/carlosrdgz/";
const LINKEDIN_HANDLE = "carlosrdgz";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

type DetailId =
  | "metric"
  | "pathDifficulty"
  | "pointsVsRank"
  | "overview"
  | "advancedStats"
  | "headToHead"
  | "groups"
  | "stages"
  | "simulation";

interface DetailConfig {
  titleKey: string;
  bodyKey: string;
  actionHref?: string;
  actionLabelKey?: string;
  externalHref?: string;
  externalLabelKey?: string;
}

const DETAIL_CONFIG: Record<DetailId, DetailConfig> = {
  metric: {
    titleKey: "metricTitle",
    bodyKey: "metricDetail",
    externalHref: FIFA_RANKING_METHODOLOGY_URL,
    externalLabelKey: "metricSource",
  },
  pathDifficulty: {
    titleKey: "pathDifficultyTitle",
    bodyKey: "pathDifficultyDetail",
  },
  pointsVsRank: {
    titleKey: "pointsVsRankTitle",
    bodyKey: "pointsVsRankDetail",
  },
  overview: {
    titleKey: "overviewTitle",
    bodyKey: "overviewDetail",
    actionHref: "/overview",
    actionLabelKey: "overviewOpen",
  },
  advancedStats: {
    titleKey: "advancedStatsTitle",
    bodyKey: "advancedStatsDetail",
    actionHref: "/",
    actionLabelKey: "teamPathOpen",
  },
  headToHead: {
    titleKey: "headToHeadTitle",
    bodyKey: "headToHeadDetail",
    actionHref: "/compare",
    actionLabelKey: "compareOpen",
  },
  groups: {
    titleKey: "groupsTitle",
    bodyKey: "groupsDetail",
    actionHref: "/groups",
    actionLabelKey: "groupsOpen",
  },
  stages: {
    titleKey: "stagesTitle",
    bodyKey: "stagesDetail",
  },
  simulation: {
    titleKey: "simulationTitle",
    bodyKey: "simulationDetail",
    actionHref: "/simulate",
    actionLabelKey: "simulateOpen",
  },
};

const FEATURES: Array<{
  id: DetailId;
  icon: LucideIcon;
  titleKey: string;
  summaryKey: string;
}> = [
  {
    id: "advancedStats",
    icon: Route,
    titleKey: "advancedStatsTitle",
    summaryKey: "advancedStatsSummary",
  },
  {
    id: "overview",
    icon: ChartColumn,
    titleKey: "overviewTitle",
    summaryKey: "overviewSummary",
  },
  {
    id: "headToHead",
    icon: GitCompareArrows,
    titleKey: "headToHeadTitle",
    summaryKey: "headToHeadSummary",
  },
  {
    id: "groups",
    icon: LayoutGrid,
    titleKey: "groupsTitle",
    summaryKey: "groupsSummary",
  },
  {
    id: "stages",
    icon: ListFilter,
    titleKey: "stagesTitle",
    summaryKey: "stagesSummary",
  },
  {
    id: "simulation",
    icon: Sparkles,
    titleKey: "simulationTitle",
    summaryKey: "simulationSummary",
  },
];

const METHODOLOGY_PILLARS: Array<{
  id: DetailId;
  titleKey: string;
  summaryKey: string;
  bulletKeys: [string, string];
}> = [
  {
    id: "metric",
    titleKey: "metricTitle",
    summaryKey: "metricSummary",
    bulletKeys: ["metricBullet1", "metricBullet2"],
  },
  {
    id: "pathDifficulty",
    titleKey: "pathDifficultyTitle",
    summaryKey: "pathDifficultySummary",
    bulletKeys: ["pathDifficultyBullet1", "pathDifficultyBullet2"],
  },
  {
    id: "pointsVsRank",
    titleKey: "pointsVsRankTitle",
    summaryKey: "pointsVsRankSummary",
    bulletKeys: ["pointsVsRankBullet1", "pointsVsRankBullet2"],
  },
];

export function AboutPageClient() {
  const t = useTranslations("about");
  const [activeDetail, setActiveDetail] = useState<DetailId | null>(null);

  const detail = activeDetail ? DETAIL_CONFIG[activeDetail] : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{t("title")}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      <div className="space-y-6">
        <section id="origin" className="glass-panel space-y-4 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">
            {t("groupOrigin")}
          </h2>
          <p className="max-w-3xl leading-7 text-muted-foreground">
            {t("originSummary")}
          </p>
        </section>

        <section id="methodology" className="glass-panel space-y-6 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">
            {t("groupMethodology")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {METHODOLOGY_PILLARS.map((pillar) => (
              <div key={pillar.id} className="space-y-3">
                <h3 className="text-sm font-semibold text-white">
                  {t(pillar.titleKey)}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {t(pillar.summaryKey)}
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {pillar.bulletKeys.map((key) => (
                    <li key={key} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-wc-sky" />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto px-0 text-wc-sky"
                  onClick={() => setActiveDetail(pillar.id)}
                >
                  {t("learnMore")}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="glass-panel space-y-6 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">
            {t("groupFeatures")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {FEATURES.map((feature) => (
              <AboutFeatureCard
                key={feature.id}
                icon={feature.icon}
                title={t(feature.titleKey)}
                summary={t(feature.summaryKey)}
                ctaLabel={t("learnMore")}
                onLearnMore={() => setActiveDetail(feature.id)}
              />
            ))}
          </div>
        </section>

        <section id="data" className="glass-panel space-y-6 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">
            {t("groupData")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">
                {t("rankingModesTitle")}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {t("rankingModesSummary")}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">
                {t("dataTitle")}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {t.rich("dataSummary", {
                  openfootball: (chunks) => (
                    <a
                      href={OPENFOOTBALL_WORLDCUP_JSON_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-wc-sky hover:underline"
                    >
                      {chunks}
                    </a>
                  ),
                  rapidapi: (chunks) => (
                    <a
                      href={RAPIDAPI_WORLD_FOOTBALL_RANKING_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-wc-sky hover:underline"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="glass-panel space-y-6 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">
            {t("groupContact")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-white/70">{t("maintainerLabel")}</p>
              <p className="text-muted-foreground">{t("maintainerName")}</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-white/70">{t("contactEmailLabel")}</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-wc-sky hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-white/70">{t("contactGithubLabel")}</p>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-wc-sky hover:underline"
              >
                <GithubIcon className="size-4 shrink-0" />
                <span>{REPO_NAME}</span>
              </a>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-white/70">{t("contactLinkedinLabel")}</p>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-wc-sky hover:underline"
              >
                <LinkedinIcon className="size-4 shrink-0" />
                <span>{LINKEDIN_HANDLE}</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {detail ? (
        <AboutDetailDialog
          open={activeDetail !== null}
          onOpenChange={(open) => {
            if (!open) setActiveDetail(null);
          }}
          title={t(detail.titleKey)}
          body={t(detail.bodyKey)}
          actionHref={detail.actionHref}
          actionLabel={
            detail.actionLabelKey ? t(detail.actionLabelKey) : undefined
          }
          externalHref={detail.externalHref}
          externalLabel={
            detail.externalLabelKey ? t(detail.externalLabelKey) : undefined
          }
        />
      ) : null}
    </div>
  );
}
