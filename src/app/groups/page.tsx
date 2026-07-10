import { Suspense } from "react";
import { GroupsPageClient } from "@/components/groups-page-client";
import { ComparisonGroupsSkeleton } from "@/components/loading-skeletons";

export default function GroupsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8">
          <ComparisonGroupsSkeleton />
        </div>
      }
    >
      <GroupsPageClient />
    </Suspense>
  );
}
