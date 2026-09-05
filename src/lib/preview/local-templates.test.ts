import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { detectKind, localPreviewHtml } from "./local-templates.ts";

describe("local-templates", () => {
  it("detects preview kind from the brief", () => {
    assert.equal(detectKind("personal kanban board"), "kanban");
    assert.equal(detectKind("chat assistant for notes"), "chat");
    assert.equal(detectKind("habit streak tracker"), "habits");
    assert.equal(detectKind("monthly calendar schedule"), "calendar");
    assert.equal(detectKind("markdown note editor"), "notes");
    assert.equal(detectKind("something calm"), "landing");
  });

  it("returns injectable HTML for each known kind", () => {
    for (const brief of [
      "kanban inbox doing done",
      "chat assistant",
      "habit streak",
      "calendar events",
      "notes markdown",
      "generic landing",
    ]) {
      const preview = localPreviewHtml(brief);
      assert.ok(preview.title.trim().length > 0, brief);
      assert.ok(preview.html.includes("<!DOCTYPE html>") || preview.html.includes("<html"), brief);
      assert.ok(preview.html.length > 200, brief);
      assert.ok(preview.code.includes("local"), brief);
    }
  });
});
