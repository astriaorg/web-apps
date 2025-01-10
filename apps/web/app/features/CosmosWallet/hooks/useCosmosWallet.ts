import { useContext } from "react";

import { CosmosWalletContext, CosmosWalletContextProps } from "../contexts/CosmosWalletContext";

export const useCosmosWallet = (): CosmosWalletContextProps => {
  const context = useContext(CosmosWalletContext);
  if (!context) {
    throw new Error("useCosmosWallet must be used within CosmosWalletProvider");
  }
  return context;
};
