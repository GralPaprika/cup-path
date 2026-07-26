import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getCarouselWindowLetters,
  normalizeWheelDelta,
  orderRotatingGroupLetters,
  parseVisibleGroupLetters,
  takeCarouselWheelSteps,
  wrapCarouselIndex,
} from "@/lib/client/simulate-ui-preference";

describe("parseVisibleGroupLetters", () => {
  const letters = ["A", "B", "C", "D", "E", "F"];

  it("pins the focus group first and keeps valid selections", () => {
    assert.deepEqual(parseVisibleGroupLetters(["C", "A", "Z"], letters, "B"), [
      "B",
      "C",
      "A",
    ]);
  });

  it("defaults to all groups with the focus group first when nothing is stored", () => {
    assert.deepEqual(parseVisibleGroupLetters(null, letters, "D"), [
      "D",
      "A",
      "B",
      "C",
      "E",
      "F",
    ]);
  });

  it("falls back to all groups without a focus team", () => {
    assert.deepEqual(
      parseVisibleGroupLetters(undefined, letters, null),
      letters,
    );
  });
});

describe("orderRotatingGroupLetters", () => {
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  it("starts after the focus letter and wraps alphabetically", () => {
    assert.deepEqual(orderRotatingGroupLetters(letters, "A").slice(0, 3), [
      "B",
      "C",
      "D",
    ]);
    assert.deepEqual(orderRotatingGroupLetters(letters, "J").slice(0, 3), [
      "K",
      "L",
      "A",
    ]);
  });

  it("ignores the focus letter in the rotating pool", () => {
    assert.ok(!orderRotatingGroupLetters(letters, "J").includes("J"));
  });
});

describe("wrapCarouselIndex", () => {
  it("normalizes negatives and overflow into range", () => {
    assert.equal(wrapCarouselIndex(0, 11), 0);
    assert.equal(wrapCarouselIndex(11, 11), 0);
    assert.equal(wrapCarouselIndex(-1, 11), 10);
    assert.equal(wrapCarouselIndex(12, 11), 1);
  });

  it("returns 0 for empty length", () => {
    assert.equal(wrapCarouselIndex(5, 0), 0);
  });
});

describe("getCarouselWindowLetters", () => {
  const rotating = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

  it("returns a contiguous window from the start", () => {
    assert.deepEqual(getCarouselWindowLetters(rotating, 0, 3), [
      "B",
      "C",
      "D",
    ]);
  });

  it("wraps past the end so every letter can lead the window", () => {
    assert.deepEqual(getCarouselWindowLetters(rotating, 8, 3), [
      "J",
      "K",
      "L",
    ]);
    assert.deepEqual(getCarouselWindowLetters(rotating, 9, 3), [
      "K",
      "L",
      "B",
    ]);
    assert.deepEqual(getCarouselWindowLetters(rotating, 10, 3), [
      "L",
      "B",
      "C",
    ]);
  });

  it("accepts negative and overflowing indices via wrap", () => {
    assert.deepEqual(getCarouselWindowLetters(rotating, -1, 3), [
      "L",
      "B",
      "C",
    ]);
    assert.deepEqual(getCarouselWindowLetters(rotating, 11, 3), [
      "B",
      "C",
      "D",
    ]);
  });

  it("does not repeat letters when the list is shorter than slots", () => {
    assert.deepEqual(getCarouselWindowLetters(["B", "C"], 0, 3), ["B", "C"]);
    assert.deepEqual(getCarouselWindowLetters(["B", "C"], 1, 3), ["C", "B"]);
  });

  it("returns an empty array for empty input", () => {
    assert.deepEqual(getCarouselWindowLetters([], 0, 3), []);
  });
});

describe("normalizeWheelDelta", () => {
  it("picks the dominant axis", () => {
    assert.equal(normalizeWheelDelta(80, 10, 0), 80);
    assert.equal(normalizeWheelDelta(10, 80, 0), 80);
    assert.equal(normalizeWheelDelta(-80, 10, 0), -80);
  });

  it("maps up/left to negative and down/right to positive", () => {
    assert.ok(normalizeWheelDelta(0, -100, 0) < 0);
    assert.ok(normalizeWheelDelta(-100, 0, 0) < 0);
    assert.ok(normalizeWheelDelta(0, 100, 0) > 0);
    assert.ok(normalizeWheelDelta(100, 0, 0) > 0);
  });

  it("scales line and page delta modes", () => {
    assert.equal(normalizeWheelDelta(0, 3, 1), 48);
    assert.equal(normalizeWheelDelta(0, 1, 2), 100);
    assert.equal(normalizeWheelDelta(0, 50, 0), 50);
  });

  it("returns 0 when both axes are zero", () => {
    assert.equal(normalizeWheelDelta(0, 0, 0), 0);
  });
});

describe("takeCarouselWheelSteps", () => {
  it("returns no steps below the threshold and keeps the remainder", () => {
    assert.deepEqual(takeCarouselWheelSteps(30, 80), {
      steps: 0,
      remainder: 30,
    });
  });

  it("returns exact multiples as whole steps with zero remainder", () => {
    assert.deepEqual(takeCarouselWheelSteps(160, 80), {
      steps: 2,
      remainder: 0,
    });
  });

  it("supports negative direction", () => {
    assert.deepEqual(takeCarouselWheelSteps(-200, 80), {
      steps: -2,
      remainder: -40,
    });
  });

  it("carries remainder across calls", () => {
    const first = takeCarouselWheelSteps(100, 80);
    assert.deepEqual(first, { steps: 1, remainder: 20 });
    assert.deepEqual(takeCarouselWheelSteps(first.remainder + 70, 80), {
      steps: 1,
      remainder: 10,
    });
  });
});
