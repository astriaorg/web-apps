export class KeplrWalletError extends Error {
  constructor(
    message = "Failed to get account from Keplr wallet. Does this address have funds for the selected chain?",
  ) {
    super(message);
    this.name = "KeplrWalletError";
  }
}
