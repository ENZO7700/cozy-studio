import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  COZY_SCRIPT_ATTR,
  COZY_ELEMENTS_SOURCE,
  injectCozyElements,
  cozyElementsScriptTag,
  standaloneHtml,
  stripRogueCozyScripts,
} from "./cozy-elements.ts";

describe("cozy-elements", () => {
  it("injects the runtime in head when present", () => {
    const html = injectCozyElements("<html><head></head><body><p>hi</p></body></html>");
    assert.match(html, new RegExp(COZY_SCRIPT_ATTR));
    assert.match(html, /customElements\.define/);
    assert.match(html, /cozy-card/);
    assert.ok(html.indexOf("data-cozy-elements") < html.indexOf("<body"));
  });

  it("injects the runtime before </body> when head is absent", () => {
    const html = injectCozyElements("<html><body><p>hi</p></body></html>");
    assert.match(html, new RegExp(COZY_SCRIPT_ATTR));
    assert.ok(html.indexOf("data-cozy-elements") < html.indexOf("</body>"));
  });

  it("replaces an existing runtime instead of duplicating", () => {
    const once = injectCozyElements("<body></body>");
    const twice = injectCozyElements(once);
    assert.equal(twice.split(COZY_SCRIPT_ATTR).length - 1, 1);
    assert.equal(twice.includes(cozyElementsScriptTag().slice(0, 40)), true);
  });

  it("standaloneHtml adds doctype, charset, and cozy runtime", () => {
    const out = standaloneHtml("<body><cozy-app></cozy-app></body>");
    assert.match(out, /^<!DOCTYPE html>/i);
    assert.match(out, /<meta[^>]+charset/i);
    assert.match(out, new RegExp(COZY_SCRIPT_ATTR));
    assert.match(out, /cozy-app/);
  });

  it("standaloneHtml is idempotent on already-injected HTML", () => {
    const bare = "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/></head><body><cozy-app></cozy-app></body></html>";
    const once = standaloneHtml(bare);
    const twice = standaloneHtml(once);
    assert.equal(twice.split(COZY_SCRIPT_ATTR).length - 1, 1);
    assert.equal(once, twice);
  });

  it("strips rogue cozy custom element scripts from generated HTML", () => {
    const rogue =
      '<html><head></head><body><script>customElements.define("cozy-app", class extends HTMLElement {})</script></body></html>';
    const cleaned = stripRogueCozyScripts(rogue);
    assert.doesNotMatch(cleaned, /customElements\.define\s*\(\s*["']cozy-app/);
  });

  it("caps cozy-app kicker guidance in the runtime source", () => {
    assert.match(COZY_ELEMENTS_SOURCE, /writing-mode:horizontal-tb/);
    assert.match(COZY_ELEMENTS_SOURCE, /const max = 24/);
  });
});
