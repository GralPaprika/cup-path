"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { usePersistedUiState } from "@/hooks/use-persisted-ui-state";
import { SHELL_SIDEBAR_COLLAPSED_KEY } from "@/lib/client/shell-preference";

type StateUpdater<T> = T | ((prev: T) => T);

interface SidebarCollapseContextValue {
  collapsed: boolean;
  setCollapsed: (next: StateUpdater<boolean>) => void;
}

const SidebarCollapseContext =
  createContext<SidebarCollapseContextValue | null>(null);

export function SidebarCollapseProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = usePersistedUiState(
    SHELL_SIDEBAR_COLLAPSED_KEY,
    false,
  );

  useEffect(() => {
    document.documentElement.dataset.sidebarCollapsed = collapsed
      ? "true"
      : "false";
  }, [collapsed]);

  const value = useMemo(
    () => ({ collapsed, setCollapsed }),
    [collapsed, setCollapsed],
  );

  return (
    <SidebarCollapseContext.Provider value={value}>
      {children}
    </SidebarCollapseContext.Provider>
  );
}

export function useSidebarCollapse(): SidebarCollapseContextValue {
  const context = useContext(SidebarCollapseContext);
  if (!context) {
    throw new Error(
      "useSidebarCollapse must be used within SidebarCollapseProvider",
    );
  }
  return context;
}
