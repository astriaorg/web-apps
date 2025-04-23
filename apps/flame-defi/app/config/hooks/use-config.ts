"use client";

import { useContext } from "react";

import { AstriaChain } from "@repo/flame-types";
import { ConfigContext } from "../contexts/config-context";

/**
 * Hook to use the config context.
 */
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigContextProvider.");
  }
  return context;
};

// FIXME - probably move this to AstriaWalletContext
export const useAstriaChainData = () => {
  const { astriaChains } = useConfig();
  const astriaChainsData = Object.values(astriaChains);
  const selectedChain = astriaChainsData[0] as AstriaChain;

  const nativeToken = selectedChain.currencies.find(
    (currency) => currency.isNative,
  );
  const wrappedNativeToken = selectedChain.currencies.find(
    (currency) => currency.isWrappedNative,
  );

  return { chain: selectedChain, nativeToken, wrappedNativeToken };
};
