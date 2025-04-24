import { useChain } from "@cosmos-kit/react";
import React, { useCallback, useEffect, useState } from "react";

import type { SigningStargateClient } from "@cosmjs/stargate";
import { useConfig } from "config";

import { CosmosChainInfo, cosmosChainNameFromId } from "@repo/flame-types";

export interface CosmosWalletContextProps {
  connectCosmosWallet: () => void;
  cosmosAccountAddress: string | null;
  disconnectCosmosWallet: () => void;
  getCosmosSigningClient: () => Promise<SigningStargateClient>;
  resetState: () => void;
  // NOTE - need to track selectedCosmosChain here because there is no
  //  functionality like wagmi's useAccount provided by cosmos kit
  selectedCosmosChain: CosmosChainInfo | null;
  selectCosmosChain: (chain: CosmosChainInfo | null) => void;
}

export const CosmosWalletContext =
  React.createContext<CosmosWalletContextProps>({} as CosmosWalletContextProps);

interface CosmosWalletProviderProps {
  children: React.ReactNode;
}

export const CosmosWalletProvider: React.FC<CosmosWalletProviderProps> = ({
  children,
}) => {
  const { cosmosChains, selectedFlameNetwork } = useConfig();
  const [selectedCosmosChain, setSelectedCosmosChain] =
    useState<CosmosChainInfo | null>(null);

  // use first chain as default chain
  const defaultChainId = Object.values(cosmosChains)[0]?.chainId;
  if (!defaultChainId) {
    throw new Error("No cosmos chains provided.");
  }
  const chainName = cosmosChainNameFromId(
    selectedCosmosChain?.chainId || defaultChainId,
  );
  const {
    address: cosmosAddressFromWallet,
    openView: openCosmosWalletModal,
    getSigningStargateClient: getCosmosSigningClient,
    disconnect,
    isWalletConnected,
  } = useChain(chainName);

  // we are keeping track of the address ourselves so that we can clear it if
  // needed, e.g. to allow for manual address entry
  const [cosmosAccountAddress, setCosmosAccountAddress] = useState<
    string | null
  >(null);

  useEffect(() => {
    // make sure the address is set when the address changes
    if (cosmosAddressFromWallet) {
      setCosmosAccountAddress(cosmosAddressFromWallet);
    }
  }, [cosmosAddressFromWallet]);

  const resetState = useCallback(() => {
    setSelectedCosmosChain(null);
    setCosmosAccountAddress(null);
  }, []);

  // deselect chain and currency when network is changed
  useEffect(() => {
    resetState();
    if (selectedFlameNetwork) {
      resetState();
    }
  }, [resetState, selectedFlameNetwork]);

  const selectCosmosChain = useCallback((chain: CosmosChainInfo | null) => {
    setSelectedCosmosChain(chain);
  }, []);

  // opens CosmosKit modal for user to connect their Cosmos wallet
  const connectCosmosWallet = useCallback(() => {
    // only open modal if not already connected
    if (!isWalletConnected) {
      console.log("opening cosmos wallet modal");
      openCosmosWalletModal();
    }
  }, [openCosmosWalletModal, isWalletConnected]);

  const disconnectCosmosWallet = useCallback(() => {
    disconnect().then(() => {});
    resetState();
  }, [disconnect, resetState]);

  const value = {
    connectCosmosWallet,
    cosmosAccountAddress,
    getCosmosSigningClient,
    disconnectCosmosWallet,
    resetState,
    selectedCosmosChain,
    selectCosmosChain,
  };

  return (
    <CosmosWalletContext.Provider value={value}>
      {children}
    </CosmosWalletContext.Provider>
  );
};
