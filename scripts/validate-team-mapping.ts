import type { RankingMode } from "../src/lib/types";
import { getAllTeams } from "../src/lib/data/team-registry";
import { getRankingsSnapshot } from "../src/lib/data/rankings-store";

const MODES: RankingMode[] = ["yearStart", "tournamentStart", "live"];

async function validateTeamMapping() {
  const teams = getAllTeams();
  let hasErrors = false;

  for (const mode of MODES) {
    const snapshot = await getRankingsSnapshot(mode);
    const rankedIds = new Set(snapshot.entries.map((entry) => entry.teamId));
    const missing = teams.filter((team) => !rankedIds.has(team.id));

    console.log(`\nMode: ${mode}`);
    console.log(`  Rankings entries: ${snapshot.entries.length}`);
    console.log(`  WC teams: ${teams.length}`);

    if (missing.length > 0) {
      hasErrors = true;
      console.error(`  Missing teams (${missing.length}):`);
      for (const team of missing) {
        console.error(`    - ${team.id} (${team.displayName})`);
      }
    } else {
      console.log("  All teams mapped.");
    }
  }

  if (hasErrors) {
    process.exit(1);
  }

  console.log("\nValidation passed.");
}

validateTeamMapping().catch((error) => {
  console.error(error);
  process.exit(1);
});
