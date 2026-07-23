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
import { DEFAULT_RANKING_MODE } from "@/lib/data/ranking-modes";
import type { RankingMode } from "@/lib/types";
import {
  readRankingModePreference,
  writeRankingModePreference,
} from "@/lib/client/ranking-mode-preference";

interface RankingModeContextValue {
  mode: RankingMode;
  setMode: (mode: RankingMode) => void;
}

const RankingModeContext = createContext<RankingModeContextValue | null>(null);

export function RankingModeProvider({
  children,
  initialMode = DEFAULT_RANKING_MODE,
}: {
  children: ReactNode;
  initialMode?: RankingMode;
}) {
  const [mode, setModeState] = useState<RankingMode>(initialMode);

  useEffect(() => {
    // Recover localStorage preference after hydration when the cookie was absent.
    const preferred = readRankingModePreference();
    if (preferred) {
      setModeState((current) => {
        if (current === preferred) return current;
        writeRankingModePreference(preferred);
        return preferred;
      });
      return;
    }

    writeRankingModePreference(initialMode);
  }, [initialMode]);

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
