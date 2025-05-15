import { useContext } from "react";

import {
  PrivyWalletContext,
  type PrivyWalletContextProps,
} from "../contexts/privy-wallet-context";

export const usePrivyWallet = (): PrivyWalletContextProps => {
  const context = useContext(PrivyWalletContext);
  if (!context) {
    throw new Error("usePrivyWallet must be used within PrivyWalletProvider.");
  }
  return context;
};
