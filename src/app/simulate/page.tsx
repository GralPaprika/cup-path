import { getAllTeamsEnriched } from "@/lib/data/team-registry";
import { SimulationPageClient } from "@/components/pages/simulation-page-client";

export default async function SimulatePage() {
  const teams = await getAllTeamsEnriched("live");

  return <SimulationPageClient teams={teams} />;
}
