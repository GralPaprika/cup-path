import { redirect } from "next/navigation";

type AnalysisRedirectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Legacy URL; prefer `/team-analysis`. */
export default async function AnalysisRedirectPage({
  searchParams,
}: AnalysisRedirectPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }

  const suffix = query.toString();
  redirect(suffix ? `/team-analysis?${suffix}` : "/team-analysis");
}
