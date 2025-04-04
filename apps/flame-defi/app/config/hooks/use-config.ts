"use client";

import { useContext } from "react";
import { ConfigContext } from "../contexts/config-context";
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

export const useAstriaChainData = () => {
  const { astriaChains } = useConfig();
  const astriaChainsData = Object.values(astriaChains);
  const selectedChain = astriaChainsData[0] as EvmChainInfo;

  return { selectedChain };
};
