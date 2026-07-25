import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveRankingMode } from "@/lib/api/ranking-mode";

describe("resolveRankingMode", () => {
  it("prefers an explicit mode over the cookie", () => {
    const request = new Request("http://localhost", {
      headers: { cookie: "RANKING_MODE_V2=june11" },
    });
    assert.equal(resolveRankingMode(request, "april"), "april");
  });

  it("uses the versioned cookie when no explicit mode is supplied", () => {
    const request = new Request("http://localhost", {
      headers: { cookie: "other=x; RANKING_MODE_V2=january" },
    });
    assert.equal(resolveRankingMode(request), "january");
  });

  it("defaults when neither source is present", () => {
    assert.equal(resolveRankingMode(new Request("http://localhost")), "july20");
  });
});
