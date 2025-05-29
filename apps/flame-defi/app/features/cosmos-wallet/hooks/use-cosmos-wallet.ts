import { useContext } from "react";

import {
  CosmosWalletContext,
  type CosmosWalletContextProps,
} from "../contexts/cosmos-wallet-context";

export const useCosmosWallet = (): CosmosWalletContextProps => {
  const context = useContext(CosmosWalletContext);
  if (!context) {
    throw new Error(
      "useCosmosWallet must be used within CosmosWalletProvider.",
    );
  }
  return context;
};
