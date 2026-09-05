import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  formatRelativeActive,
  loadProfile,
  normalizeHandle,
  saveProfile,
  touchProfileActivity,
} from "./profile.ts";

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
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
    },
  });
});

describe("profile", () => {
  it("normalizes handles with a leading @", () => {
    assert.equal(normalizeHandle("enzo"), "@enzo");
    assert.equal(normalizeHandle("@enzo"), "@enzo");
    assert.equal(normalizeHandle("  "), "@local");
  });

  it("creates a default profile then round-trips patches", () => {
    const fresh = loadProfile();
    assert.equal(fresh.displayName, "Lokálny profil");
    assert.equal(fresh.handle, "@local");
    assert.equal(fresh.generateCount, 0);

    const saved = saveProfile({ displayName: "Enzo", handle: "enzo" });
    assert.equal(saved.displayName, "Enzo");
    assert.equal(saved.handle, "@enzo");
    assert.equal(loadProfile().displayName, "Enzo");
  });

  it("increments generateCount on touchProfileActivity", () => {
    loadProfile();
    const next = touchProfileActivity({ generated: true });
    assert.equal(next.generateCount, 1);
    assert.equal(touchProfileActivity().generateCount, 1);
  });

  it("formats relative activity in Slovak", () => {
    assert.equal(formatRelativeActive(Date.now()), "dnes");
    assert.equal(formatRelativeActive(Date.now() - 2 * 24 * 60 * 60 * 1000), "pred 2 dňami");
  });
});
