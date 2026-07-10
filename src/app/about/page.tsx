import { getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("about");

  const sections = [
    { title: t("methodologyTitle"), body: t("methodologyBody") },
    { title: t("comparisonTitle"), body: t("comparisonBody") },
    { title: t("rankGapTitle"), body: t("rankGapBody") },
    { title: t("stagesTitle"), body: t("stagesBody") },
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
          </div>
        </section>
      ))}
    </div>
  );
}
