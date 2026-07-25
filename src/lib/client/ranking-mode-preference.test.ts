import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  RANKING_MODE_COOKIE,
  RANKING_MODE_STORAGE_KEY,
  readRankingModePreference,
  writeRankingModePreference,
} from "@/lib/client/ranking-mode-preference";

const values = new Map<string, string>();
let cookie = "";

beforeEach(() => {
  values.clear();
  cookie = "";
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {},
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      get cookie() {
        return cookie;
      },
      set cookie(value: string) {
        cookie = value;
      },
    },
  });
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
  Reflect.deleteProperty(globalThis, "localStorage");
  Reflect.deleteProperty(globalThis, "document");
});

describe("ranking mode preference v2", () => {
  it("uses versioned storage and cookie keys", () => {
    assert.equal(RANKING_MODE_STORAGE_KEY, "cuppath:ranking-mode:v2");
    assert.equal(RANKING_MODE_COOKIE, "RANKING_MODE_V2");
  });

  it("ignores legacy preferences", () => {
    values.set("cuppath:ranking-mode", "june11");
    cookie = "RANKING_MODE=june11";
    assert.equal(readRankingModePreference(), null);
  });

  it("round-trips the current preference through storage and cookie", () => {
    writeRankingModePreference("april");
    assert.equal(values.get(RANKING_MODE_STORAGE_KEY), "april");
    assert.match(cookie, /^RANKING_MODE_V2=april;/);
    assert.equal(readRankingModePreference(), "april");
  });

  it("falls back to the v2 cookie when storage is empty", () => {
    cookie = "other=value; RANKING_MODE_V2=january";
    assert.equal(readRankingModePreference(), "january");
  });
});
