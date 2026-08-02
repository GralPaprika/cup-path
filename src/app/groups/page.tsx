import { Suspense } from "react";
import { GroupsPageClient } from "@/components/pages/groups-page-client";
import { ComparisonGroupsSkeleton } from "@/components/loading-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

function GroupsPageFallback() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48 bg-white/10 sm:h-9 sm:w-56" />
        <Skeleton className="h-4 w-full max-w-2xl bg-white/10 sm:h-5" />
      </header>
      <div className="glass-panel p-5 sm:p-6">
        <ComparisonGroupsSkeleton />
      </div>
    </div>
  );
}

export default function GroupsPage() {
  return (
    <Suspense fallback={<GroupsPageFallback />}>
      <GroupsPageClient />
    </Suspense>
  );
}
