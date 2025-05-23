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

/**
 * Provider for the EVM wallet context. The EVM wallet context
 * differs from the Astria wallet context in that it is for pages that
 * need to connect to other EVM chains (Base, Arbitrum, etc.)
 *
 * E.g., the bridge page needs to support connecting to other EVM chains
 * like Base, Arbitrum, etc.
 *
 * FIXME - this context made sense at one point, but the only thing it does
 *  that the Astria wallet context doesn't do is `connectToSpecificChain`,
 *  which is used to connect to an EVM chain selected from Bridge source dropdown.
 *  We could probably just have one context for evm wallet connections.
 */
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
