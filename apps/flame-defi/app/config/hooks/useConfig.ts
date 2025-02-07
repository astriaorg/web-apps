"use client";

import { useContext } from "react";

import { ConfigContext } from "../contexts/ConfigContext";
import { EvmChainInfo } from "@repo/flame-types";

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

  return { selectedChain };
};
