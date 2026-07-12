import type { GroupQualificationStatus } from "@/lib/types";

export const QUALIFICATION_ROW_STYLES: Record<
  Exclude<GroupQualificationStatus, null>,
  string
> = {
  first: "bg-wc-green/12 hover:bg-wc-green/18",
  second: "bg-wc-sky/12 hover:bg-wc-sky/18",
  bestThird: "bg-wc-purple/12 hover:bg-wc-purple/18",
};

export const QUALIFICATION_LEGEND_STYLES: Record<
  Exclude<GroupQualificationStatus, null>,
  string
> = {
  first: "bg-wc-green/50",
  second: "bg-wc-sky/50",
  bestThird: "bg-wc-purple/50",
};
