import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve("./e2e-tests/wallet-setup/.env.e2e-tests"),
});

// eslint-disable-next-line turbo/no-undeclared-env-vars
const appUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://127.0.0.1:3000";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e-tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  timeout: 60_000,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  forbidOnly: Boolean(process.env.CI),
  /* Retry on CI only */
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: appUrl,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    extraHTTPHeaders: (() => {
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
      if (secret) {
        return { "x-vercel-protection-bypass": secret };
      }
      // NOTE - must type empty return to avoid lint error
      return {} as Record<string, string>;
    })(),
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: appUrl,
    reuseExistingServer: true,
  },
});
