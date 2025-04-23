// Import necessary Synpress modules
import { defineWalletSetup } from "@synthetixio/synpress";
import { MetaMask } from "@synthetixio/synpress/playwright";
import { BrowserContext, Page } from "@playwright/test";

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
  // NOTE - had to add `as Foo` to below args because I was getting a ts error w/o them,
  //  even though BrowserContext from @playwright/test and playwright-core seem to be
  //  the same type???
  const metamask = new MetaMask(
    context as BrowserContext,
    walletPage as Page,
    PASSWORD,
  );

  // Import the wallet using the seed phrase
  await metamask.importWallet(SEED_PHRASE);
  await metamask.importWalletFromPrivateKey(PRIVATE_KEY);

  // Additional setup steps can be added here, such as:
  // - Adding custom networks
  // - Importing tokens
  // - Setting up specific account states
});
