import type { Round16Analysis } from "@/lib/types";
import {
  KnockoutStagePanel,
  type KnockoutStageTranslationNamespace,
} from "@/components/knockout-stage-panel";

interface RoundOf16PanelProps {
  analysis: Round16Analysis;
  mode: string;
}

const TRANSLATION_NAMESPACE: KnockoutStageTranslationNamespace =
  "home.roundOf16";

export function RoundOf16Panel({ analysis, mode }: RoundOf16PanelProps) {
  return (
    <KnockoutStagePanel
      analysis={analysis}
      mode={mode}
      translationNamespace={TRANSLATION_NAMESPACE}
      wideOpponentDifficultyBars
    />
  );
}
