import { Page } from "@playwright/test";
import { testWithSynpress } from "@synthetixio/synpress";
import { metaMaskFixtures } from "@synthetixio/synpress/playwright";

import basicSetup from "../wallet-setup/basic.setup";

// Create a test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup));

// Extract expect function from test
const { expect } = test;

// Valid EVM test address to use for manual override tests
const TEST_RECIPIENT_ADDRESS = "0x1111111111111111111111111111111111111111";

// A helper function to find and click the "To" dropdown
async function openToDropdown(page: Page) {
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
  const potentialDropdowns = await page
    .locator('.bg-radial-dark, div.absolute, [role="dialog"]')
    .all();
  console.log(`Found ${potentialDropdowns.length} potential dropdown elements`);

  // Instead of looking for a dialog, look for the specific option in dropdown
  const manualAddressOption = page.locator('text="Enter Address Manually"');
  await manualAddressOption.waitFor({ state: "visible", timeout: 10000 });
  console.log("Found 'Enter address manually' option");

  // Click the option
  await manualAddressOption.click();
  console.log("Clicked 'Enter address manually' option");
}

// Define the test case for just the manual address functionality - simplifying for debugging
test("should handle manual address entry in the deposit flow", async ({
  page,
}) => {
  // Navigate to the bridge deposit page
  await page.goto("/bridge/deposit");

  // Try to interact with the To dropdown - the new implementation handles clicking "Enter Address Manually"
  await openToDropdown(page);

  // Enter manual address in the input field with a wait
  await page.waitForSelector('input[placeholder="0x..."]', { timeout: 10000 });
  await page.locator('input[placeholder="0x..."]').fill(TEST_RECIPIENT_ADDRESS);
  console.log("Filled in test address");

  // Click save button
  await page.locator('button:has-text("Save")').click();
  console.log("Clicked Save button");

  // Verify that the manual address is displayed
  const addressDisplay = page.locator(
    `text=${TEST_RECIPIENT_ADDRESS.substring(0, 6)}`,
  );
  await expect(addressDisplay).toBeVisible();
  console.log("Address display verified");
});
