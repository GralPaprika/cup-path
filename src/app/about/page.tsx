import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AboutPage() {
  const t = await getTranslations("about");

  const sections = [
    { title: t("methodologyTitle"), body: t("methodologyBody") },
    { title: t("rankGapTitle"), body: t("rankGapBody") },
    { title: t("dataTitle"), body: t("dataBody") },
    { title: t("rankingModesTitle"), body: t("rankingModesBody") },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <section className="rounded-2xl border border-hermes-100/60 bg-white/80 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-hermes-900">{t("title")}</h1>
      </section>
      {sections.map((section) => (
        <Card key={section.title} className="border-hermes-100/60 shadow-sm">
          <CardHeader className="border-b bg-hermes-50/50">
            <CardTitle className="text-hermes-800">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="leading-7 text-muted-foreground">{section.body}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
