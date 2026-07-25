import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPageUrl, mergePageParams } from "@/lib/client/url-params";

describe("page URL parameters", () => {
  it("preserves unrelated parameters and removes legacy mode", () => {
    const params = mergePageParams("?mode=june11&utm_source=test", []);
    assert.equal(params.toString(), "utm_source=test");
  });

  it("replaces managed parameters and removes omitted values", () => {
    const params = mergePageParams(
      "?team=ARG&vs=ESP&utm_source=test",
      ["team", "vs"],
      { team: "BRA", vs: "" },
    );
    assert.equal(params.toString(), "utm_source=test&team=BRA");
  });

  it("preserves the hash when building a URL", () => {
    const params = new URLSearchParams({ team: "ESP" });
    assert.equal(buildPageUrl("/", params, "#path"), "/?team=ESP#path");
  });
});
