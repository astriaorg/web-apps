// Import necessary Synpress modules
import { defineWalletSetup } from "@synthetixio/synpress";
import { MetaMask } from "@synthetixio/synpress/playwright";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const SEED_PHRASE = process.env.SEED_PHRASE;
// eslint-disable-next-line turbo/no-undeclared-env-vars
const PASSWORD = process.env.PASSWORD;
// eslint-disable-next-line turbo/no-undeclared-env-vars
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!SEED_PHRASE || !PASSWORD || !PRIVATE_KEY) {
  throw new Error("Must set SEED_PHRASE, PASSWORD, PRIVATE_KEY");
}

// Define the basic wallet setup
export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // Create a new MetaMask instance
  const metamask = new MetaMask(context, walletPage, PASSWORD);

  // Import the wallet using the seed phrase
  await metamask.importWallet(SEED_PHRASE);
  await metamask.importWalletFromPrivateKey(PRIVATE_KEY);

  // Additional setup steps can be added here, such as:
  // - Adding custom networks
  // - Importing tokens
  // - Setting up specific account states
});
