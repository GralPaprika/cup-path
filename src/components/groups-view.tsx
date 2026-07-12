"use client";

import { useEffect, useRef } from "react";
import type {
  GroupComparisonCard,
  GroupPointsBenchmarks,
  GroupStrengthOrdering,
} from "@/lib/types";
import { GroupCard } from "@/components/groups/group-card";
import { GroupDetailPanel } from "@/components/group-detail-panel";
import { GroupsAdvancedPanel } from "@/components/groups-advanced-panel";
import { GROUP_CARDS_GRID_CLASS } from "@/components/groups/layout-classes";
import { QualificationLegend } from "@/components/groups/qualification-legend";
import { scrollIntoViewRespectingMotion } from "@/lib/client/scroll-into-view";

interface GroupsViewProps {
  groups: GroupComparisonCard[];
  strengthOrdering: GroupStrengthOrdering;
  pointsBenchmarks: GroupPointsBenchmarks | null;
  selectedGroupLetter: string;
  onSelectGroup: (groupLetter: string) => void;
  selectedTeamId?: string;
  advancedOpen: boolean;
  onAdvancedOpenChange: (open: boolean) => void;
  detailScrollTrigger: number;
}

export function GroupsView({
  groups,
  strengthOrdering,
  pointsBenchmarks,
  selectedGroupLetter,
  onSelectGroup,
  selectedTeamId,
  advancedOpen,
  onAdvancedOpenChange,
  detailScrollTrigger,
}: GroupsViewProps) {
  const detailPanelRef = useRef<HTMLDivElement>(null);

  const selectedGroup = groups.find(
    (group) => group.groupLetter === selectedGroupLetter,
  );

  const teamGroupLetter = selectedTeamId
    ? groups.find((group) =>
        group.teams.some((entry) => entry.team.id === selectedTeamId),
      )?.groupLetter
    : undefined;

  useEffect(() => {
    if (detailScrollTrigger === 0) return;
    scrollIntoViewRespectingMotion(detailPanelRef.current);
  }, [detailScrollTrigger]);

  return (
    <div className="space-y-6">
      <QualificationLegend />

      <div className={GROUP_CARDS_GRID_CLASS}>
        {groups.map((group) => (
          <GroupCard
            key={group.groupLetter}
            group={group}
            strengthOrdering={strengthOrdering}
            isSelected={group.groupLetter === selectedGroupLetter}
            isTeamGroup={group.groupLetter === teamGroupLetter}
            selectedTeamId={selectedTeamId}
            onSelect={() => onSelectGroup(group.groupLetter)}
          />
        ))}
      </div>

      {selectedGroup && (
        <div ref={detailPanelRef}>
          <GroupDetailPanel
            group={selectedGroup}
            pointsBenchmarks={pointsBenchmarks}
            selectedTeamId={selectedTeamId}
          />
        </div>
      )}

      <GroupsAdvancedPanel
        groups={groups}
        strengthOrdering={strengthOrdering}
        pointsBenchmarks={pointsBenchmarks}
        selectedGroupLetter={selectedGroupLetter}
        open={advancedOpen}
        onOpenChange={onAdvancedOpenChange}
        onSelectGroup={onSelectGroup}
      />
    </div>
  );
}
