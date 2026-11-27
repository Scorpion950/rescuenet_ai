import test from "node:test";
import assert from "node:assert/strict";
import { safeDestination, rememberDestination, consumeDestination } from "../src/utils/authNavigation.js";

test("keeps valid in-app destinations", () => {
  assert.equal(safeDestination("/report?draft=1"), "/report?draft=1");
  assert.equal(safeDestination("/sos"), "/sos");
});

test("rejects external and malformed redirects", () => {
  for (const value of ["https://evil.example", "//evil.example", "/\\evil", "not-a-route", "\n/report", null]) {
    assert.equal(safeDestination(value), null);
  }
});

test("uses a safe default when storage is unavailable", () => {
  assert.equal(rememberDestination("https://evil.example"), "/report");
  assert.equal(consumeDestination({ returnTo: "//evil.example" }), "/report");
});
