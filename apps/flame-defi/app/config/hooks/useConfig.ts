"use client";

import { useContext } from "react";

import { ConfigContext } from "../contexts/ConfigContext";

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
  const chainId = evmChainsData[0]?.chainId || 0;
  const currencies = evmChainsData[0]?.currencies;

  return { chainId, currencies, evmChainsData: evmChainsData[0] };
};
