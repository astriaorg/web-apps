import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import React, { useCallback, useEffect, useState } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";

export interface EvmWalletContextProps {
  connectEvmWallet: () => void;
  connectToSpecificChain: (chainId: number) => void;
  disconnectEvmWallet: () => void;
  evmAccountAddress: string | null;
  resetState: () => void;
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
  const { openConnectModal } = useConnectModal();
  const { openChainModal } = useChainModal();
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
    }
  }, [userAccount.address]);

  const resetState = useCallback(() => {
    console.log("EVM wallet state reset called");
    setEvmAccountAddress(null);
  }, []);

  const connectEvmWallet = useCallback(
    () => openConnectModal?.(),
    [openConnectModal],
  );

  const connectToSpecificChain = (chainId: number) => {
    console.log({ evmAccountAddress, chainId });
    if (!evmAccountAddress) {
      // FIXME - how do i switch chains after they connect?
      openConnectModal?.();
    } else {
      switchChain({ chainId });
    }
  };

  const disconnectEvmWallet = useCallback(() => {
    disconnect();
    resetState();
  }, [disconnect, resetState]);

  const value = {
    connectEvmWallet,
    connectToSpecificChain,
    disconnectEvmWallet,
    evmAccountAddress,
    resetState,
  };

  return (
    <EvmWalletContext.Provider value={value}>
      {children}
    </EvmWalletContext.Provider>
  );
};
