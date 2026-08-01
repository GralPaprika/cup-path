import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHART_COLORS,
  TEAM_KIT_COLORS,
  KIT_FALLBACK_BLACK,
  KIT_FALLBACK_WHITE,
  KIT_SITE_PURPLE,
  colorFamily,
  getTeamKitColor,
  needsChartStroke,
  resolveHeadToHeadKitColors,
  resolveSimulateKitColors,
  styleFromFill,
} from "@/lib/chart-colors";

describe("team kit chart colors", () => {
  it("covers all 48 World Cup teams with home and away hexes", () => {
    assert.equal(Object.keys(TEAM_KIT_COLORS).length, 48);
    for (const [id, kit] of Object.entries(TEAM_KIT_COLORS)) {
      assert.match(kit.home, /^#[0-9A-Fa-f]{6}$/, `${id} home`);
      assert.match(kit.away, /^#[0-9A-Fa-f]{6}$/, `${id} away`);
    }
  });

  it("keeps existing SF/Final kit hues for ARG ENG FRA ESP", () => {
    assert.equal(getTeamKitColor("ARG", "home"), "#74ACDF");
    assert.equal(getTeamKitColor("ENG", "home"), "#F8FAFC");
    assert.equal(getTeamKitColor("FRA", "home"), "#002654");
    assert.equal(getTeamKitColor("ESP", "home"), "#E31937");
  });

  it("uses white accents for black kit fills", () => {
    const style = styleFromFill("NOR", getTeamKitColor("NOR", "away")!);
    assert.equal(colorFamily(style.fill), "black");
    assert.equal(style.accent, KIT_FALLBACK_WHITE);
    assert.equal(colorFamily(style.outline!), "red");
  });

  it("treats France home navy as dark with white accent", () => {
    const style = styleFromFill("FRA", getTeamKitColor("FRA", "home")!);
    assert.equal(colorFamily(style.fill), "black");
    assert.equal(style.accent, KIT_FALLBACK_WHITE);
  });

  it("gives Norway red and Spain cream when Norway is selected", () => {
    const kit = resolveHeadToHeadKitColors("NOR", "ESP");
    assert.equal(kit.colorA, getTeamKitColor("NOR", "home"));
    assert.equal(colorFamily(kit.colorA), "red");
    assert.equal(kit.colorB, getTeamKitColor("ESP", "away"));
    assert.equal(colorFamily(kit.colorB), "white");
  });

  it("keeps Argentina home sky against Haiti navy (light vs dark blue)", () => {
    const kit = resolveHeadToHeadKitColors("HAI", "ARG");
    assert.equal(kit.colorA, getTeamKitColor("HAI", "home"));
    assert.equal(kit.colorB, getTeamKitColor("ARG", "home"));
    assert.equal(colorFamily(kit.colorA), "blue");
    assert.equal(colorFamily(kit.colorB), "blue");
  });

  it("forces Uruguay off home when Argentina occupies the same light blue", () => {
    const kit = resolveHeadToHeadKitColors("ARG", "URU");
    assert.equal(kit.colorA, getTeamKitColor("ARG", "home"));
    assert.notEqual(kit.colorB, getTeamKitColor("URU", "home"));
  });

  it("inverts white↔black: cream side becomes black, black side purple chrome", () => {
    // ESP away cream vs NOR away black when Spain selected vs Norway
    const kit = resolveHeadToHeadKitColors("ESP", "NOR");
    assert.equal(kit.colorA, getTeamKitColor("ESP", "home"));
    assert.equal(colorFamily(kit.colorA), "red");
    // B is Norway away black — no white partner among fills (A is red), so white accent
    assert.equal(kit.colorB, getTeamKitColor("NOR", "away"));
    assert.equal(colorFamily(kit.colorB), "black");
    assert.equal(kit.accentB, KIT_FALLBACK_WHITE);
  });

  it("applies purple chrome when white and black fills share a chart", () => {
    // Force white vs black by comparing ENG (white home) to NZL (black home)
    const kit = resolveHeadToHeadKitColors("ENG", "NZL");
    assert.equal(kit.colorA, KIT_FALLBACK_BLACK);
    assert.equal(kit.accentA, KIT_FALLBACK_BLACK);
    assert.equal(colorFamily(kit.colorB), "black");
    assert.equal(kit.outlineB, KIT_SITE_PURPLE);
    assert.equal(kit.accentB, KIT_SITE_PURPLE);
  });

  it("maps simulate actual to home and simulated to away", () => {
    const kit = resolveSimulateKitColors("ESP");
    assert.equal(kit.actual.fill, getTeamKitColor("ESP", "home"));
    assert.equal(kit.simulated.fill, getTeamKitColor("ESP", "away"));
    assert.equal(kit.teamPointsLine, kit.actual.accent);
    assert.equal(kit.comparison, undefined);
  });

  it("picks Algeria green away when Norway black uses white accents", () => {
    const kit = resolveSimulateKitColors("NOR", "ALG");
    assert.equal(kit.actual.fill, getTeamKitColor("NOR", "home"));
    assert.equal(kit.simulated.fill, getTeamKitColor("NOR", "away"));
    assert.equal(kit.simulated.accent, KIT_FALLBACK_WHITE);
    assert.equal(kit.comparison!.fill, getTeamKitColor("ALG", "away"));
    assert.equal(colorFamily(kit.comparison!.fill), "green");
  });

  it("uses all purple for Algeria when Mexico occupies green and white", () => {
    const kit = resolveSimulateKitColors("MEX", "ALG");
    assert.equal(kit.actual.fill, getTeamKitColor("MEX", "home"));
    assert.equal(kit.simulated.fill, getTeamKitColor("MEX", "away"));
    assert.equal(kit.comparison!.fill, KIT_SITE_PURPLE);
    assert.equal(kit.comparison!.accent, KIT_SITE_PURPLE);
    assert.equal(kit.comparison!.outline, KIT_SITE_PURPLE);
  });

  it("falls back to semantic palette for unknown teams", () => {
    const kit = resolveHeadToHeadKitColors("ZZZ", "YYY");
    assert.equal(kit.colorA, CHART_COLORS.selectedTeam);
    assert.ok(
      kit.colorB === KIT_FALLBACK_WHITE || kit.colorB === KIT_FALLBACK_BLACK,
    );
  });

  it("flags near-white fills for chart strokes", () => {
    assert.equal(needsChartStroke("#F8FAFC"), true);
    assert.equal(needsChartStroke("#E31937"), false);
  });
});
