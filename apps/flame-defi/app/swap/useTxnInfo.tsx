import { TokenState } from "@repo/flame-types";

export function useTxnInfo(inputOne: TokenState, inputTwo: TokenState) {
  // TODO: pull in real token values and balances from api and calculate the txn info here

  switch (true) {
    case !inputOne.token || !inputTwo.token:
      return "Select a token";
    case inputOne.value === undefined || inputTwo.value === undefined:
      return "Enter an amount";
    case inputOne.value === "0" || inputTwo.value === "0":
      return "Amount must be greater than 0";
    case inputTwo.token?.coinDenom === "WTIA":
      return "Wrap";
    default:
      return "Swap";
  }
}
