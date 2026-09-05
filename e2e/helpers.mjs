import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const FIXTURE_HTML = readFileSync(
  join(ROOT, "e2e/fixtures/kanban-preview.html"),
  "utf8",
);

export const MOCK_GENERATE_OK = {
  ok: true,
  title: "Audit Kanban",
  html: FIXTURE_HTML,
  code: `/* e2e fixture */\n${FIXTURE_HTML}`,
  provider: "mistral",
  model: "codestral-latest",
};

/** Stub generatePreview server-fn POSTs (TanStack RPC + fetch shapes). */
export async function mockGeneratePreview(page, result = MOCK_GENERATE_OK) {
  await page.route("**/*", async (route) => {
    const req = route.request();
    if (req.method() === "POST") {
      const body = req.postData() || "";
      const blob = `${req.url()}\n${body}`;
      if (/getAiStatus/i.test(blob)) {
        await route.continue();
        return;
      }
      if (
        /generatePreview/i.test(blob) ||
        (/prompt/i.test(body) && /_serverFn|serverFn|createServerFn|generate/i.test(blob))
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(result),
        });
        return;
      }
    }
    await route.continue();
  });

  await page.addInitScript((payload) => {
    const orig = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      const url = typeof input === "string" ? input : input?.url || "";
      const method = String(
        init?.method || (typeof input !== "string" && input?.method) || "GET",
      ).toUpperCase();
      const body = init?.body != null ? String(init.body) : "";
      const blob = `${url}\n${body}`;
      if (method === "GET" || /getAiStatus/i.test(blob)) return orig(input, init);
      if (
        /generatePreview/i.test(blob) ||
        (method === "POST" && /prompt/i.test(body) && /_serverFn|generate/i.test(blob))
      ) {
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return orig(input, init);
    };
  }, result);
}
