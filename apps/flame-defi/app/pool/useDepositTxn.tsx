import { TokenState } from "@repo/ui/types";

export function useDepositTxn(inputOne: TokenState, inputTwo: TokenState) {
  // TODO: pull in real token values and balances from api and calculate the txn info here

  if (inputOne.value === undefined || inputTwo.value === undefined) {
    return "Enter an amount";
  } else if (inputOne.value === 0 || inputTwo.value === 0) {
    return "Amount must be greater than 0";
  } else {
    return "Deposit";
  }
}
