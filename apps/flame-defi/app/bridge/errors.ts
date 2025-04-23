export class DepositError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DepositError";
  }
}

export class WalletConnectionError extends Error {
  constructor(message = "Please connect your wallets first.") {
    super(message);
    this.name = "WalletConnectionError";
  }
}

export class WithdrawError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WithdrawError";
  }
}
