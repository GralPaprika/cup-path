import assert from "node:assert/strict";
import { describe, it } from "node:test";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";

function leafKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("message catalogs", () => {
  it("keeps English and Spanish translation keys in parity", () => {
    assert.deepEqual(leafKeys(es).sort(), leafKeys(en).sort());
  });
});
