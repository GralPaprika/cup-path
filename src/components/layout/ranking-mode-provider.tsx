"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { parseRankingMode } from "@/lib/data/ranking-modes";
import type { RankingMode } from "@/lib/types";
import {
  resolveRankingMode,
  writeRankingModePreference,
} from "@/lib/client/ranking-mode-preference";

interface RankingModeContextValue {
  mode: RankingMode;
  setMode: (mode: RankingMode) => void;
}

const RankingModeContext = createContext<RankingModeContextValue | null>(null);

export function RankingModeProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const [mode, setModeState] = useState<RankingMode>(() =>
    resolveRankingMode(searchParams.get("mode")),
  );

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode) {
      const resolved = parseRankingMode(urlMode);
      setModeState((current) => {
        if (current !== resolved) {
          writeRankingModePreference(resolved);
        }
        return resolved;
      });
    }
  }, [searchParams]);

  const setMode = useCallback((next: RankingMode) => {
    writeRankingModePreference(next);
    setModeState(next);
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <RankingModeContext.Provider value={value}>
      {children}
    </RankingModeContext.Provider>
  );
}

export function useRankingMode(): RankingModeContextValue {
  const context = useContext(RankingModeContext);
  if (!context) {
    throw new Error("useRankingMode must be used within RankingModeProvider");
  }
  return context;
}
