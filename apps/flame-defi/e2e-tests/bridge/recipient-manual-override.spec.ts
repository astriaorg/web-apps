// Import necessary Synpress modules and setup
import { testWithSynpress } from "@synthetixio/synpress";
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";
import basicSetup from "../wallet-setup/basic.setup";

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup));

// Extract expect function from test
const { expect } = test;

// Valid EVM test address to use for manual override tests
const TEST_RECIPIENT_ADDRESS = "0x1111111111111111111111111111111111111111";

// A helper function to connect the source wallet
async function connectSourceWallet(page, metamask) {
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

// A helper function to find and click the "To" dropdown
async function openToDropdown(page) {
  console.log("Starting to interact with To dropdown");
  
  // Add a stability delay
  await page.waitForTimeout(2000);
  
  // Look for the dropdown button by its placeholder text which is unique
  // Looking at content-section.tsx line 435, the placeholder is "Connect wallet or enter address"
  const dropdownSelector = 'button:has-text("Select destination...")';
  await page.waitForSelector(dropdownSelector, { timeout: 10000 });
  console.log("Found To dropdown button");
  
  // Click the dropdown button directly
  await page.locator(dropdownSelector).click({ force: true });
  console.log("Clicked on To dropdown button");
  
  
  // Check for elements with UI debugging info
  console.log("Examining UI for dropdown content");
  const potentialDropdowns = await page.locator('.bg-radial-dark, div.absolute, [role="dialog"]').all();
  console.log(`Found ${potentialDropdowns.length} potential dropdown elements`);
  
  // Instead of looking for a dialog, look for the specific option in dropdown
  const manualAddressOption = page.locator('text="Enter address manually"');
  await manualAddressOption.waitFor({ state: 'visible', timeout: 10000 });
  console.log("Found 'Enter address manually' option");
  
  // Click the option
  await manualAddressOption.click();
  console.log("Clicked 'Enter address manually' option");
}

// Define the test case for just the manual address functionality - simplifying for debugging
test("should handle manual address entry in the deposit flow", async ({
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
  
  // Connect the source wallet (simplify with helper function)
  await connectSourceWallet(page, metamask);
  
  // First, select a source chain (needed to enable the Deposit button)
  await page.locator('button:has-text("Select source...")').first().click();
  
  // Wait for dropdown content without expecting a dialog role
  await page.waitForSelector('div.absolute', { timeout: 10000 });
  
  // Select the first available chain option
  await page.locator('div.absolute button').first().click();

  // Try to interact with the To dropdown - the new implementation handles clicking "Enter address manually"
  await openToDropdown(page);

  // Enter manual address in the input field with a wait
  await page.waitForSelector('input[placeholder="0x..."]', { timeout: 10000 });
  await page.locator('input[placeholder="0x..."]').fill(TEST_RECIPIENT_ADDRESS);
  console.log("Filled in test address");

  // Click save button
  await page.locator('button:has-text("Save")').click();
  console.log("Clicked Save button");

  // Verify that the manual address is displayed
  const addressDisplay = page.locator(`text=${TEST_RECIPIENT_ADDRESS.substring(0, 6)}`);
  await expect(addressDisplay).toBeVisible();
  console.log("Address display verified");

  // Enter an amount to complete the form
  await page.locator('[placeholder="0.00"]').fill("0.01");
  console.log("Entered amount");

  // Verify the deposit button is enabled when using manual address
  const depositButton = page.locator('button:has-text("Deposit")');
  await expect(depositButton).toBeEnabled();
  console.log("Deposit button is enabled");
});
