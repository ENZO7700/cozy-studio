import { test, expect } from "@playwright/test";

test.describe("landing", () => {
  test("shows hero and navigates to studio and account", async ({ page }) => {
    const errors = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("body")).toContainText(/Brief|preview|Studio/i);

    await page.getByRole("link", { name: /Open Studio|Studio/i }).first().click();
    await expect(page).toHaveURL(/\/studio/);
    await expect(page.locator("[data-studio-shell]")).toBeVisible();

    await page.goto("/");
    await page.getByRole("link", { name: /Account|Účet/i }).first().click();
    await expect(page).toHaveURL(/\/account/);

    const serious = errors.filter(
      (e) => !/favicon|Download the React DevTools|notFound/i.test(e),
    );
    expect(serious, serious.join("\n")).toEqual([]);
  });
});
