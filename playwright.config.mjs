import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.mjs",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:8080",
    headless: true,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  outputDir: "screenshots/e2e-results",
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:8080/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
