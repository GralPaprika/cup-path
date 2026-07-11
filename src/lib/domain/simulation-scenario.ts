import type { SimulationScenario } from "@/lib/types";

export function emptySimulationScenario(): SimulationScenario {
  return { knockoutWinners: {}, slotOverrides: {} };
}

export function parseSimulationScenario(
  raw: string | null,
): SimulationScenario {
  if (!raw) return emptySimulationScenario();
  try {
    const parsed = JSON.parse(raw) as SimulationScenario;
    return {
      knockoutWinners: parsed.knockoutWinners ?? {},
      slotOverrides: parsed.slotOverrides ?? {},
      groupFinishes: parsed.groupFinishes,
    };
  } catch {
    return emptySimulationScenario();
  }
}
