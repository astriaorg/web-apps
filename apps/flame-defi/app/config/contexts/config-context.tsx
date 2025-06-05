import React, { useMemo } from "react";
import { type Address } from "viem";

import { AstriaChains, CosmosChains, FlameNetwork } from "@repo/flame-types";
import { getFromLocalStorage, setInLocalStorage } from "@repo/ui/utils";
import {
  type AppConfig,
  type Environment,
  getChainConfigs,
  getEnvVariable,
  getOptionalEnvVariable,
} from "config";

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
  const environment = getEnvVariable("NEXT_PUBLIC_ENV") as Environment;
  const brandURL = getEnvVariable("NEXT_PUBLIC_BRAND_URL");
  const bridgeURL = getEnvVariable("NEXT_PUBLIC_BRIDGE_URL");
  const swapURL = getEnvVariable("NEXT_PUBLIC_SWAP_URL");
  const poolURL = getEnvVariable("NEXT_PUBLIC_POOL_URL");
  const earnAPIURL = getEnvVariable("NEXT_PUBLIC_EARN_API_URL");
  const swapQuoteAPIURL = getEnvVariable("NEXT_PUBLIC_SWAP_QUOTE_API_URL");

  const defaultSlippageTolerance = 0.1;

  const currentSettings = getFromLocalStorage("settings") || {};

  if (!currentSettings.slippageTolerance) {
    setInLocalStorage("settings", {
      ...currentSettings,
      slippageTolerance: defaultSlippageTolerance,
    });
  }

  const feedbackFormURL = getOptionalEnvVariable(
    "NEXT_PUBLIC_FEEDBACK_FORM_URL",
  );

  const feeRecipient = getOptionalEnvVariable(
    "NEXT_PUBLIC_FEE_RECIPIENT",
  ) as Address;

  // default to Mainnet
  // TODO - remember in localStorage?
  const [selectedFlameNetwork, setSelectedFlameNetwork] =
    React.useState<FlameNetwork>(FlameNetwork.MAINNET);

  const { astriaChains: astria, cosmosChains: cosmos } =
    getChainConfigs(selectedFlameNetwork);
  const [astriaChains, setAstriaChains] = React.useState<AstriaChains>(astria);
  const [cosmosChains, setCosmosChains] = React.useState<CosmosChains>(cosmos);

  const networksList = useMemo(() => {
    return getEnvVariable(
      "NEXT_PUBLIC_NETWORK_LIST_OPTIONS",
      "dusk,mainnet",
    ).split(",") as FlameNetwork[];
  }, []);

  // update astria and cosmos chains when the network is changed
  const selectFlameNetwork = (network: FlameNetwork) => {
    console.log("selectFlameNetwork called with:", network);
    const { astriaChains, cosmosChains } = getChainConfigs(network);
    setAstriaChains(astriaChains);
    setCosmosChains(cosmosChains);
    setSelectedFlameNetwork(network);
  };

  // parse feature flags - explicitly check for "true"
  const earnEnabled =
    getEnvVariable("NEXT_PUBLIC_FEATURE_EARN_ENABLED", "false") === "true";
  const poolEnabled =
    getEnvVariable("NEXT_PUBLIC_FEATURE_POOL_ENABLED", "false") === "true";

  return (
    <ConfigContext.Provider
      value={{
        environment,
        cosmosChains,
        astriaChains,
        selectedFlameNetwork,
        selectFlameNetwork,
        brandURL,
        bridgeURL,
        swapURL,
        poolURL,
        earnAPIURL,
        feedbackFormURL,
        feeRecipient,
        swapQuoteAPIURL,
        networksList,
        defaultSlippageTolerance,
        featureFlags: {
          earnEnabled,
          poolEnabled,
        },
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
