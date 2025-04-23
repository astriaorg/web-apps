import { useContext } from "react";

import {
  EvmWalletContext,
  type EvmWalletContextProps,
} from "../contexts/evm-wallet-context";

export const useEvmWallet = (): EvmWalletContextProps => {
  const context = useContext(EvmWalletContext);
  if (!context) {
    throw new Error("useEvmWallet must be used within EvmWalletProvider.");
  }
  return context;
};
