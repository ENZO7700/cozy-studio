import { test, expect } from "@playwright/test";

const RECENT = {
  id: "e2e-recent-1",
  title: "Pinned Kanban",
  brief: "kanban board",
  html: `<!DOCTYPE html><html><body><cozy-board data-audit="pinned"><cozy-column name="Inbox"></cozy-column></cozy-board></body></html>`,
  code: "/* pinned */",
  at: Date.now(),
};

test.describe("account flow", () => {
  test("shows pinned recent, opens studio, persists profile name", async ({ page }) => {
    // Seed once — addInitScript alone would overwrite localStorage on every reload.
    await page.addInitScript((recent) => {
      if (sessionStorage.getItem("e2e-account-seeded") === "1") return;
      sessionStorage.setItem("e2e-account-seeded", "1");
      localStorage.setItem("cozy-studio-recents", JSON.stringify([recent]));
      localStorage.setItem("cozy-studio-starred", JSON.stringify([recent.id]));
      localStorage.setItem(
        "cozy-studio-profile",
        JSON.stringify({
          displayName: "Audit User",
          handle: "@audit",
          avatarDataUrl: null,
          coverDataUrl: null,
          memberSince: Date.now() - 86400000,
          lastActive: Date.now(),
          generateCount: 2,
        }),
      );
    }, RECENT);

    await page.goto("/account");
    await expect(page.getByText("Audit User").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Otvoriť Pinned Kanban/i })).toBeVisible();

    await page.getByRole("button", { name: /Otvoriť Pinned Kanban/i }).click();
    await expect(page).toHaveURL(/\/studio\?recent=/);
    await expect(page.locator("[data-studio-shell]")).toBeVisible();
    await expect
      .poll(
        async () =>
          page.locator('iframe[data-preview="live"]').first().getAttribute("srcdoc"),
        { timeout: 15000 },
      )
      .toMatch(/data-audit=["']pinned["']|Inbox/i);

    await page.goto("/account");
    await page.getByRole("button", { name: /Upraviť profil/i }).click();
    const dialog = page.getByRole("dialog", { name: /Upraviť profil/i });
    await expect(dialog).toBeVisible();
    await dialog.locator('input[type="text"]').first().fill("Audit Renamed");
    await dialog.getByRole("button", { name: /Uložiť/i }).click();
    await expect(page.getByText("Audit Renamed").first()).toBeVisible();

    await page.reload();
    await expect(page.getByText("Audit Renamed").first()).toBeVisible();
  });
});
