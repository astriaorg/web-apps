// Import necessary Synpress modules and setup
import { testWithSynpress } from "@synthetixio/synpress";
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";
import basicSetup from "./wallet-setup/basic.setup";

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup));

// Extract expect function from test
const { expect } = test;

// Define a basic test case
test("should connect wallet using navigation menu wallet connector button", async ({
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

  // Navigate to the swap page,
  // b/c Bridge page no longer has navigation menu wallet connector button.
  await page.goto("/swap");

  // Click the Connect Wallet button in the navigation menu
  // The button is inside a nav element with the "Connect Wallet" text
  await page.locator('nav button:has-text("Connect Wallet")').click();

  // RainbowKit modal opens - click on the MetaMask button
  await page.locator('button:has-text("MetaMask")').click();

  // Connect MetaMask to the dapp (this handles the MetaMask approval popup)
  await metamask.connectToDapp();

  await metamask.approveNewNetwork();

  await metamask.approveSwitchNetwork();

  // Verify that we're now connected (button text should change to "Connected")
  await expect(page.locator('nav button:has-text("Connected")')).toBeVisible();
});
