"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import React, { useCallback, useEffect, useState } from "react";

export interface PrivyWalletContextProps {
  connectPrivyWallet: () => void;
  disconnectPrivyWallet: () => void;
  privyAccountAddress: string | null;
  resetState: () => void;
  privyIsConnected: boolean;
  privyIsConnecting: boolean;
}

export const PrivyWalletContext = React.createContext<PrivyWalletContextProps>(
  {} as PrivyWalletContextProps,
);

interface PrivyWalletProviderProps {
  children: React.ReactNode;
}

export const PrivyWalletProvider: React.FC<PrivyWalletProviderProps> = ({
  children,
}) => {
  const { login, logout, ready, authenticated } = usePrivy();
  const { wallets } = useWallets();

  const [privyAccountAddress, setPrivyAccountAddress] = useState<string | null>(
    null,
  );

  // Set the address when the wallets change
  useEffect(() => {
    if (wallets && wallets.length > 0 && authenticated) {
      // Use the first embedded wallet
      const embeddedWallet = wallets.find(
        (wallet) => wallet.walletClientType === "privy",
      );

      if (embeddedWallet && embeddedWallet.address) {
        setPrivyAccountAddress(embeddedWallet.address);
      } else if (wallets[0]?.address) {
        // Fallback to first wallet if no embedded wallet found
        setPrivyAccountAddress(wallets[0].address);
      }
    } else {
      setPrivyAccountAddress(null);
    }
  }, [wallets, authenticated]);

  const resetState = useCallback(() => {
    console.log("Privy wallet state reset called");
    setPrivyAccountAddress(null);
  }, []);

  const connectPrivyWallet = useCallback(() => {
    if (!authenticated && ready) {
      login();
    }
  }, [authenticated, login, ready]);

  const disconnectPrivyWallet = useCallback(() => {
    void logout();
    resetState();
  }, [logout, resetState]);

  const value = {
    connectPrivyWallet,
    disconnectPrivyWallet,
    privyAccountAddress,
    resetState,
    privyIsConnected: authenticated && Boolean(privyAccountAddress),
    privyIsConnecting: !ready,
  };

  return (
    <PrivyWalletContext.Provider value={value}>
      {children}
    </PrivyWalletContext.Provider>
  );
};
