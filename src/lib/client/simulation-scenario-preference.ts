import {
  emptySimulationScenario,
  parseSimulationScenario,
} from "@/lib/domain/core/simulation-scenario";
import type { SimulationScenario } from "@/lib/types";

export const SIMULATION_SCENARIO_STORAGE_KEY = "cuppath:simulate-scenario";

export function readSimulationScenarioPreference(): SimulationScenario {
  if (typeof window === "undefined") return emptySimulationScenario();

  const raw = localStorage.getItem(SIMULATION_SCENARIO_STORAGE_KEY);
  if (!raw) return emptySimulationScenario();

  return parseSimulationScenario(raw);
}

export function writeSimulationScenarioPreference(
  scenario: SimulationScenario,
): void {
  localStorage.setItem(SIMULATION_SCENARIO_STORAGE_KEY, JSON.stringify(scenario));
}

export function clearSimulationScenarioPreference(): void {
  localStorage.removeItem(SIMULATION_SCENARIO_STORAGE_KEY);
}
