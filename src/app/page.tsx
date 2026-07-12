import { Suspense } from "react";
import { redirect } from "next/navigation";
import { FactsPageClient } from "@/components/pages/facts-page-client";
import { FactsPageSkeleton } from "@/components/loading-skeletons";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  if (params.team) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string") query.set(key, value);
    }
    redirect(`/team-analysis?${query.toString()}`);
  }

  return (
    <Suspense fallback={<FactsPageSkeleton />}>
      <FactsPageClient />
    </Suspense>
  );
}
