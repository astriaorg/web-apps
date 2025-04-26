export class ChainCurrencyMismatchError extends Error {
  constructor(chainId: string, currencyChainId: string) {
    super(`Currency chain ID (${currencyChainId}) does not match the provided chain ID (${chainId})`);
    this.name = 'ChainCurrencyMismatchError';
  }
}

export class KeplrWalletError extends Error {
  constructor(
    message = "Failed to get account from Keplr wallet. Does this address have funds for the selected chain?",
  ) {
    super(message);
    this.name = "KeplrWalletError";
  }
}
