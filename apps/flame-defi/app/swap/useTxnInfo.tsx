import { TokenState } from "./page";

export function useTxnInfo(inputOne: TokenState, inputTwo: TokenState) {
  // TODO: pull in real token values and balances from api and calculate the txn info here

  if (!inputOne.token || !inputTwo.token) {
    return "Select a token";
  } else if (inputOne.value === undefined || inputTwo.value === undefined) {
    return "Enter an amount";
  } else if (inputOne.value === 0 || inputTwo.value === 0) {
    return "Amount must be greater than 0";
  } else {
    return "Swap";
  }
}
