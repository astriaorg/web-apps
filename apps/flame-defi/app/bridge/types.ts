import {
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";

/**
 * Represents the selection of a blockchain chain, currency, and address.
 */
export interface ChainConnection {
  chain: EvmChainInfo | CosmosChainInfo | null;
  currency: EvmCurrency | IbcCurrency | null;
  address: string | null;
  isConnected: boolean;
}

export class WithdrawError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WithdrawError";
  }
}

export class AstriaWalletError extends WithdrawError {
  constructor(
    message = "Failed to connect to Astria wallet. Please try again.",
  ) {
    super(message);
    this.name = "AstriaWalletError";
  }
}

export class DepositError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DepositError";
  }
}

export class WalletConnectionError extends DepositError {
  constructor(message = "Please connect your wallets first.") {
    super(message);
    this.name = "WalletConnectionError";
  }
}

export class KeplrWalletError extends DepositError {
  constructor(
    message = "Failed to get account from Keplr wallet. Does this address have funds for the selected chain?",
  ) {
    super(message);
    this.name = "KeplrWalletError";
  }
}
