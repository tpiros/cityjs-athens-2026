import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDuration } from "../src/duration.ts";

test("parses a single unit", () => {
  assert.equal(parseDuration("45s"), 45);
});

test("adds several units together", () => {
  assert.equal(parseDuration("1h30m"), 5400);
  assert.equal(parseDuration("2h 5m 10s"), 7510);
});

test("rejects input it does not understand", () => {
  assert.throws(() => parseDuration(""), /invalid duration/i);
  assert.throws(() => parseDuration("soon"), /invalid duration/i);
  assert.throws(() => parseDuration("10x"), /invalid duration/i);
  assert.throws(() => parseDuration("1h banana"), /invalid duration/i);
});
