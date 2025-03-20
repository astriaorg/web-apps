import React, { useMemo } from "react";
import { getChainConfigs } from "../chain-configs";
import { getEnvVariable, getOptionalEnvVariable } from "../env";
import type { AppConfig } from "../index";
import {
  CosmosChains,
  EvmChains,
  FlameNetwork,
  HexString,
} from "@repo/flame-types";
import { getFromLocalStorage, setInLocalStorage } from "@repo/ui/utils";

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
  const earnAPIURL = getEnvVariable("NEXT_PUBLIC_EARN_API_URL");
  const swapQuoteAPIURL = getEnvVariable("NEXT_PUBLIC_SWAP_QUOTE_API_URL");

  const tokenApprovalAmount =
    "115792089237316195423570985008687907853269984665640564039457";

  const swapSlippageToleranceDefault = 0.1;

  const currentSettings = getFromLocalStorage("settings") || {};

  if (!currentSettings.slippageTolerance) {
    setInLocalStorage("settings", {
      ...currentSettings,
      slippageTolerance: swapSlippageToleranceDefault,
    });
  }

  const feedbackFormURL = getOptionalEnvVariable(
    "NEXT_PUBLIC_FEEDBACK_FORM_URL",
  );

  const feeRecipient = getOptionalEnvVariable(
    "NEXT_PUBLIC_FEE_RECIPIENT_ADDRESS",
  ) as HexString;

  // default to Mainnet
  // TODO - remember in localStorage?
  const [selectedFlameNetwork, setSelectedFlameNetwork] =
    React.useState<FlameNetwork>(FlameNetwork.MAINNET);

  const { evmChains: evm, cosmosChains: cosmos } =
    getChainConfigs(selectedFlameNetwork);
  const [evmChains, setEvmChains] = React.useState<EvmChains>(evm);
  const [cosmosChains, setCosmosChains] = React.useState<CosmosChains>(cosmos);

  const networksList = useMemo(() => {
    return getEnvVariable(
      "NEXT_PUBLIC_NETWORK_LIST_OPTIONS",
      "dusk,mainnet",
    ).split(",") as FlameNetwork[];
  }, []);

  // update evm and cosmos chains when the network is changed
  const selectFlameNetwork = (network: FlameNetwork) => {
    const { evmChains, cosmosChains } = getChainConfigs(network);
    setEvmChains(evmChains);
    setCosmosChains(cosmosChains);
    setSelectedFlameNetwork(network);
  };

  // Parse feature flags - explicitly check for "true"
  const earnEnabled =
    getEnvVariable("NEXT_PUBLIC_FEATURE_EARN_ENABLED", "false") === "true";
  const poolEnabled =
    getEnvVariable("NEXT_PUBLIC_FEATURE_POOL_ENABLED", "false") === "true";

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
        earnAPIURL,
        feedbackFormURL,
        feeRecipient,
        swapQuoteAPIURL,
        networksList,
        tokenApprovalAmount,
        swapSlippageToleranceDefault,
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
