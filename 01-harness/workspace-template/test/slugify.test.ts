import assert from "node:assert/strict";
import { test } from "node:test";
import { slugify } from "../src/slugify.ts";

test("joins words with dashes", () => {
  assert.equal(slugify("harness engineering"), "harness-engineering");
});

test("lowercases", () => {
  assert.equal(slugify("Hello World"), "hello-world");
});

test("drops punctuation", () => {
  assert.equal(slugify("Agents: what, exactly?"), "agents-what-exactly");
});
