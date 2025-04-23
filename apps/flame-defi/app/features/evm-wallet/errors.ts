export class AstriaWalletError extends Error {
  constructor(
    message = "Failed to connect to Astria wallet. Please try again.",
  ) {
    super(message);
    this.name = "AstriaWalletError";
  }
}
