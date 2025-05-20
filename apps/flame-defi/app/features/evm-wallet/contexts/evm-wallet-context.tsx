import { usePrivy } from "@privy-io/react-auth";
import React, { useCallback, useEffect, useState } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";

export interface EvmWalletContextProps {
  connectEvmWallet: () => void;
  connectToSpecificChain: (chainId: number) => void;
  disconnectEvmWallet: () => void;
  evmAccountAddress: string | null;
}

export const EvmWalletContext = React.createContext<EvmWalletContextProps>(
  {} as EvmWalletContextProps,
);

interface EvmWalletProviderProps {
  children: React.ReactNode;
}

export const EvmWalletProvider: React.FC<EvmWalletProviderProps> = ({
  children,
}) => {
  const { connectOrCreateWallet, logout } = usePrivy();
  const { disconnect } = useDisconnect();
  const userAccount = useAccount();
  const { switchChain } = useSwitchChain();

  const [evmAccountAddress, setEvmAccountAddress] = useState<string | null>(
    null,
  );

  // set the address when the address or chain changes
  useEffect(() => {
    if (userAccount?.address) {
      setEvmAccountAddress(userAccount.address);
    } else {
      setEvmAccountAddress(null);
    }
  }, [userAccount.address]);

  const connectEvmWallet = useCallback(
    () => connectOrCreateWallet(),
    [connectOrCreateWallet],
  );

  const connectToSpecificChain = (chainId: number) => {
    if (!evmAccountAddress) {
      // FIXME - how do i switch chains after they connect?
      connectOrCreateWallet();
    } else {
      switchChain({ chainId });
    }
  };

  const disconnectEvmWallet = useCallback(async () => {
    disconnect();
    // FIXME - do we want to logout the privy user here too?
    await logout();
  }, [disconnect, logout]);

  const value = {
    connectEvmWallet,
    connectToSpecificChain,
    disconnectEvmWallet,
    evmAccountAddress,
  };

  return (
    <EvmWalletContext.Provider value={value}>
      {children}
    </EvmWalletContext.Provider>
  );
};
