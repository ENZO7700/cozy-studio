import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldApplyLocalPreviewOnFailure } from "./run-failure.ts";

describe("shouldApplyLocalPreviewOnFailure", () => {
  it("online first fail: no local template", () => {
    assert.equal(shouldApplyLocalPreviewOnFailure(true, false), false);
  });

  it("online revise fail: no local template", () => {
    assert.equal(shouldApplyLocalPreviewOnFailure(true, true), false);
  });

  it("offline first generate: local template ok", () => {
    assert.equal(shouldApplyLocalPreviewOnFailure(false, false), true);
  });

  it("offline revise fail: preview unchanged, no local template", () => {
    assert.equal(shouldApplyLocalPreviewOnFailure(false, true), false);
  });
});
