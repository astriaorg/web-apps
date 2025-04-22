import { useContext } from "react";

import {
  AstriaWalletContext,
  type AstriaWalletContextProps,
} from "../contexts/astria-wallet-context";

export const useAstriaWallet = (): AstriaWalletContextProps => {
  const context = useContext(AstriaWalletContext);
  if (!context) {
    throw new Error(
      "useAstriaWallet must be used within AstriaWalletContextProvider.",
    );
  }
  return context;
};
