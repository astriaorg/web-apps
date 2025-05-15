// Import necessary Synpress modules and setup
import { Page } from "@playwright/test";
import { testWithSynpress } from "@synthetixio/synpress";
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";

import basicSetup from "../wallet-setup/basic.setup";

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup));

// Extract expect function from test
const { expect } = test;

test.beforeEach(async ({ page }) => {
  // Intercept requests to Base RPC endpoint and remove the Vercel bypass header
  await page.route("https://mainnet.base.org/", async (route) => {
    const request = route.request();
    const headers = { ...request.headers() };

    // Remove the problematic header only for Base RPC requests
    delete headers["x-vercel-protection-bypass"];

    await route.continue({ headers });
  });
});

// A helper function to connect the source wallet (EVM wallet)
async function connectSourceWallet(page: Page, metamask: MetaMask) {
  // Connect source wallet (EVM wallet)
  await page.locator('button:has-text("Connect Wallet")').first().click();
  await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
  await page.locator('button:has-text("EVM Wallet")').click();
  await page.locator('button:has-text("MetaMask")').click();
  await metamask.connectToDapp();
  await metamask.approveNewNetwork();
  await metamask.approveSwitchNetwork();

  // Click the wallet button again to verify connection
  await page.waitForTimeout(1000); // Give it a moment to complete the connection
  await page.locator('button:has-text("Wallets")').click();
  await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
  const walletButton = page
    .locator('div[role="dialog"] button:has-text("0x")')
    .first();
  await expect(walletButton).toBeVisible();
  // Close the dialog by clicking somewhere else
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1000); // Give UI time to stabilize
}

// Define the test case for token approval on deposit page
test("should handle token approval flow on deposit page", async ({
  context,
  page,
  metamaskPage,
  extensionId,
}) => {
  // Create a new MetaMask instance
  const metamask = new MetaMask(
    context,
    metamaskPage,
    basicSetup.walletPassword,
    extensionId,
  );

  // Navigate to the bridge deposit page
  await page.goto("/bridge/deposit");

  // Connect the source wallet (using helper function)
  await connectSourceWallet(page, metamask);

  // Select Base as source chain
  await page.locator('button:has-text("Select source...")').first().click();
  await page.waitForSelector("div.absolute", { timeout: 10000 });

  // Find and click on Base option
  const baseOption = page.locator('button:has-text("Base")').first();
  await baseOption.click();
  await metamask.approveNewNetwork();
  await metamask.approveSwitchNetwork();

  // Enter a deposit amount
  await page.locator('[placeholder="0.00"]').fill("5");
  await page.waitForTimeout(1000);

  // The button should now show "Approve Token for Spend" text
  const approveButton = page.locator(
    'button:has-text("Approve Token for Spend")',
  );
  await expect(approveButton).toBeVisible();
  await expect(approveButton).toBeEnabled();

  // TODO - test approval, but approving will cause this test to fail the next time

  // // Click the approve button
  // await approveButton.click();
  //
  // // Confirm the transaction in MetaMask
  // await metamask.confirmTransaction();
  //
  // // Wait for approval transaction to be processed
  // await page.waitForTimeout(5000);
  //
  // // After approval, the button should change back to "Deposit"
  // const depositButton = page.locator('button:has-text("Deposit")');
  // await expect(depositButton).toBeVisible();
  // await expect(depositButton).toBeEnabled();
});
