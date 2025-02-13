"use client";

import { useContext } from "react";

import { ConfigContext } from "../contexts/ConfigContext";
import { EvmChainInfo } from "@repo/flame-types";
import { Chain } from "viem";

/**
 * Hook to use the config context.
 */
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigContextProvider");
  }
  return context;
};

export const useEvmChainData = () => {
  const { evmChains } = useConfig();
  const evmChainsData = Object.values(evmChains);
  const selectedChain = evmChainsData[0] as EvmChainInfo;

  const evmChainConfig: Chain = {
    id: selectedChain?.chainId,
    name: selectedChain?.chainName,
    nativeCurrency: {
      name: selectedChain?.currencies[0]?.title,
      symbol: selectedChain?.currencies[0]?.coinDenom,
      decimals: selectedChain?.currencies[0]?.coinDecimals || 18,
    },
    rpcUrls: {
      default: {
        http: selectedChain?.rpcUrls,
      },
    },
  };

  return { selectedChain, evmChainConfig };
};
