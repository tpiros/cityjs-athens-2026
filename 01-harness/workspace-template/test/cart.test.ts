import assert from "node:assert/strict";
import { test } from "node:test";
import { total } from "../src/cart.ts";

const items = [
  { name: "sticker", price: 250, quantity: 4 },
  { name: "t-shirt", price: 1999, quantity: 1 },
];

test("multiplies price by quantity", () => {
  assert.equal(total(items), 2999);
});

test("applies a percentage discount", () => {
  assert.equal(total(items, 10), 2699);
});

test("rounds to whole pence", () => {
  assert.equal(total([{ name: "pen", price: 333, quantity: 1 }], 15), 283);
});
