import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  addRecent,
  loadRecents,
  loadStarredIds,
  toggleStarred,
} from "./recents.ts";

const store = new Map<string, string>();

function installLocalStorage() {
  const localStorage = {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorage,
  });
}

beforeEach(() => {
  store.clear();
  installLocalStorage();
});

afterEach(() => {
  store.clear();
});

describe("recents", () => {
  it("starts empty", () => {
    assert.deepEqual(loadRecents(), []);
    assert.equal(loadStarredIds().size, 0);
  });

  it("adds and caps recents", () => {
    for (let i = 0; i < 10; i++) {
      addRecent({
        title: `Board ${i}`,
        brief: `brief ${i}`,
        html: `<html>${i}</html>`,
        code: `code ${i}`,
      });
    }
    const list = loadRecents();
    assert.equal(list.length, 8);
    assert.equal(list[0].title, "Board 9");
  });

  it("replaces same title instead of duplicating", () => {
    addRecent({ title: "Kanban", brief: "a", html: "<a/>", code: "a" });
    addRecent({ title: "Kanban", brief: "b", html: "<b/>", code: "b" });
    const list = loadRecents();
    assert.equal(list.length, 1);
    assert.equal(list[0].brief, "b");
  });

  it("toggles starred ids", () => {
    const [entry] = addRecent({
      id: "r1",
      title: "Pinned",
      brief: "x",
      html: "<html/>",
      code: "x",
    });
    assert.ok(toggleStarred(entry.id).has(entry.id));
    assert.equal(toggleStarred(entry.id).has(entry.id), false);
  });
});
