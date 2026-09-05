import { test, expect } from "@playwright/test";

test.describe("studio flow", () => {
  test("starter generate fills live preview via local offline path", async ({ page, context }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/studio");
    await expect(page.locator("[data-studio-shell]")).toBeVisible();
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    await page
      .locator('aside[aria-label="Studio navigation"]')
      .locator("visible=true")
      .getByRole("button", { name: "Kanban", exact: true })
      .click();

    const canvas = page
      .locator("div.max-w-2xl")
      .filter({ hasText: "Configure starter" })
      .locator("visible=true");
    await expect(canvas).toBeVisible();
    await canvas.getByRole("button", { name: /Generate locally/i }).click();

    const frame = page.locator('iframe[data-preview="live"]').locator("visible=true");
    await expect(frame).toBeVisible({ timeout: 30000 });
    await expect
      .poll(async () => frame.getAttribute("srcdoc"), { timeout: 15000 })
      .toMatch(/cozy-board|Inbox|Doing|Done/i);

    await page.getByRole("button", { name: "More actions" }).click();
    await expect(page.getByRole("button", { name: "Copy HTML" })).toBeEnabled();
    await page.keyboard.press("Escape");

    await page.locator("header").getByRole("button", { name: "New", exact: true }).click();
    await expect(page.locator("body")).toContainText(/Pick a starter|write a brief/i);
  });
});
