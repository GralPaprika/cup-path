import { redirect } from "next/navigation";

type TeamAnalysisRedirectPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Legacy URL; Team path now lives at `/`. */
export default async function TeamAnalysisRedirectPage({
  searchParams,
}: TeamAnalysisRedirectPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
  }

  const suffix = query.toString();
  redirect(suffix ? `/?${suffix}` : "/");
}
