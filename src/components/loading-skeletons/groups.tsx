import { GROUP_CARDS_GRID_CLASS } from "@/components/groups/layout-classes";
import {
  GroupCardSkeleton,
  GroupDetailPanelSkeleton,
  GroupsAdvancedPanelSkeleton,
  QualificationLegendSkeleton,
} from "@/components/loading-skeletons/shared";

export function ComparisonGroupsSkeleton() {
  return (
    <div className="space-y-6">
      <QualificationLegendSkeleton />

      <div className={GROUP_CARDS_GRID_CLASS}>
        {Array.from({ length: 12 }).map((_, index) => (
          <GroupCardSkeleton key={index} />
        ))}
      </div>

      <GroupDetailPanelSkeleton />
      <GroupsAdvancedPanelSkeleton />
    </div>
  );
}
