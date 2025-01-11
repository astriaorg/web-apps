"use client";

import React from "react";

import { FlameNetwork, getChainConfigs } from "../chainConfigs";
import { getEnvVariable } from "../env";
import type { AppConfig, CosmosChains, EvmChains } from "../index";

export const ConfigContext = React.createContext<AppConfig | undefined>(
  undefined,
);

type ConfigContextProps = {
  children: React.ReactNode;
};

/**
 * ConfigContextProvider component to provide config context to children.
 * @param children
 */
export const ConfigContextProvider: React.FC<ConfigContextProps> = ({
  children,
}) => {
  const brandURL = getEnvVariable("NEXT_PUBLIC_BRAND_URL");
  const bridgeURL = getEnvVariable("NEXT_PUBLIC_BRIDGE_URL");
  const swapURL = getEnvVariable("NEXT_PUBLIC_SWAP_URL");
  const poolURL = getEnvVariable("NEXT_PUBLIC_POOL_URL");

  let feedbackFormURL: string | null;
  try {
    feedbackFormURL = getEnvVariable("NEXT_PUBLIC_FEEDBACK_FORM_URL");
  } catch {
    feedbackFormURL = null;
  }

  // default to Mainnet
  // TODO - remember in localStorage?
  const [selectedFlameNetwork, setSelectedFlameNetwork] =
    React.useState<FlameNetwork>(FlameNetwork.MAINNET);

  const { evm, cosmos } = getChainConfigs(selectedFlameNetwork);
  const [evmChains, setEvmChains] = React.useState<EvmChains>(evm);
  const [cosmosChains, setCosmosChains] = React.useState<CosmosChains>(cosmos);

  const showLocalNetwork =
    process.env.NEXT_PUBLIC_SHOW_LOCAL_NETWORK === "true";

  // update evm and cosmos chains when the network is changed
  const selectFlameNetwork = (network: FlameNetwork) => {
    const { evm, cosmos } = getChainConfigs(network);
    setEvmChains(evm);
    setCosmosChains(cosmos);
    setSelectedFlameNetwork(network);
  };

  return (
    <ConfigContext.Provider
      value={{
        cosmosChains,
        evmChains,
        selectedFlameNetwork,
        selectFlameNetwork,
        brandURL,
        bridgeURL,
        swapURL,
        poolURL,
        feedbackFormURL,
        showLocalNetwork,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
