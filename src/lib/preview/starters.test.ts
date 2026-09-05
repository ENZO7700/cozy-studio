import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { STARTERS, composeStarterPrompt, getStarterById } from "./starters.ts";

describe("starters", () => {
  it("exposes the five product starters", () => {
    assert.deepEqual(
      STARTERS.map((s) => s.id).sort(),
      ["calendar", "chat", "habits", "kanban", "notes"],
    );
  });

  it("gives each starter a prompt and at least one addon", () => {
    for (const starter of STARTERS) {
      assert.ok(starter.label.trim().length > 0, starter.id);
      assert.ok(starter.prompt.trim().length > 20, starter.id);
      assert.ok(Array.isArray(starter.addons) && starter.addons.length > 0, starter.id);
      for (const addon of starter.addons) {
        assert.ok(addon.id && addon.prompt, `${starter.id}/${addon.id}`);
      }
    }
  });

  it("looks up starters by id", () => {
    assert.equal(getStarterById("kanban")?.label, "Kanban");
    assert.equal(getStarterById("missing"), undefined);
  });

  it("composes selected addon prompts into the starter prompt", () => {
    const kanban = getStarterById("kanban");
    assert.ok(kanban);
    const composed = composeStarterPrompt(kanban, new Set([kanban.addons[0].id]));
    assert.match(composed, new RegExp(kanban.prompt.slice(0, 24)));
    assert.match(composed, new RegExp(kanban.addons[0].prompt.slice(0, 16)));
  });
});
