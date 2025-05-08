import { defineWalletSetup } from "@synthetixio/synpress";
import { MetaMask } from "@synthetixio/synpress/playwright";
import dotenv from "dotenv";
import path from "path";

// NOTE - path is relative to playwright.config.ts
dotenv.config({
  path: path.resolve("./e2e-tests/wallet-setup/.env.e2e-tests"),
});

// eslint-disable-next-line turbo/no-undeclared-env-vars
const SEED_PHRASE = process.env.SEED_PHRASE;
// eslint-disable-next-line turbo/no-undeclared-env-vars
const PASSWORD = process.env.PASSWORD;
// eslint-disable-next-line turbo/no-undeclared-env-vars
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PASSWORD) {
  throw new Error("Must set PASSWORD");
}

if (!PRIVATE_KEY) {
  throw new Error("Must set PRIVATE_KEY");
}

if (!SEED_PHRASE) {
  throw new Error("Must set SEED_PHRASE");
}

// Define the basic wallet setup
export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD);

  // Import the wallet using the seed phrase
  await metamask.importWallet(SEED_PHRASE);
  // FIXME - dont think i need both of these
  await metamask.importWalletFromPrivateKey(PRIVATE_KEY);

  // Additional setup steps can be added here, such as:
  // - Adding custom networks
  // - Importing tokens
  // - Setting up specific account states
});
