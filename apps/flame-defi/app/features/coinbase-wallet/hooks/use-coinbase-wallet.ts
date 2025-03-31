import { useContext } from "react";
import { CoinbaseWalletContext } from "../contexts/coinbase-wallet-context";

/**
 * Hook to access the Coinbase wallet context
 * Provides access to Coinbase wallet state and methods
 */
export function useCoinbaseWallet() {
  const context = useContext(CoinbaseWalletContext);
  
  if (context === undefined) {
    throw new Error("useCoinbaseWallet must be used within a CoinbaseWalletProvider");
  }
  
  return context;
}
