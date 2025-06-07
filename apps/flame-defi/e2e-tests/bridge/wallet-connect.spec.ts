import { testWithSynpress } from "@synthetixio/synpress";
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";

import basicSetup from "../wallet-setup/basic.setup";

const test = testWithSynpress(metaMaskFixtures(basicSetup));

const { expect } = test;

test("should connect EVM wallet from bridge connections modal", async ({
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

  // Find and click the "Connect Wallet" button in the bridge form
  await page.locator('button:has-text("Connect Wallet")').first().click();

  // Wait for the modal to appear
  await page.waitForSelector('div[role="dialog"]');

  // Find and click the EVM wallet connection button
  // (In this test, we're targeting the first wallet connect button in the modal, which should be EVM)
  await page.locator('button:has-text("EVM Wallet")').click();

  // Modal opens - click on the MetaMask button
  await page.locator('button:has-text("MetaMask")').click();

  // Wait for MetaMask to load and handle the connection
  await metamask.connectToDapp();

  // Approve the new network if needed
  await metamask.approveNewNetwork();

  // Approve switching networks if prompted
  await metamask.approveSwitchNetwork();

  // Click the wallet button again to reopen the modal and see the connected address.
  // It should now be labeled "Wallets" after one is connected.
  await page.locator('button:has-text("Wallets")').click();

  // Wait for the modal to appear again
  await page.waitForSelector('div[role="dialog"]');

  // Verify that we're now connected by checking for the wallet display in the modal
  const walletButton = page
    .locator('div[role="dialog"] button:has-text("0x")')
    .first();
  await expect(walletButton).toBeVisible();

  // Click the wallet button that shows the address (0x...)
  await walletButton.click();

  // Verify that the balance shows TIA tokens,
  // which is the native currency of the default selected cosmos chain
  await expect(page.locator("span.text-4xl:has-text('TIA')")).toBeVisible();

  // Wait for USD balance to load (this may take some time)
  // await page.waitForTimeout(5000);
  // // Verify that the balance shows a dollar value
  // await expect(page.locator("text=$")).toBeVisible();
});
