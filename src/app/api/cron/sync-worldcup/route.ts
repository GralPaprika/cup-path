import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026";

const FILES = ["worldcup.json", "worldcup.teams.json", "worldcup.groups.json"];

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV === "development";

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const outDir = path.join(process.cwd(), "data", "worldcup", "2026");
    await mkdir(outDir, { recursive: true });

    for (const file of FILES) {
      const response = await fetch(`${BASE_URL}/${file}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${file}`);
      }
      const data = await response.text();
      await writeFile(path.join(outDir, file), data, "utf-8");
    }

    return NextResponse.json({ ok: true, files: FILES });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 },
    );
  }
}
