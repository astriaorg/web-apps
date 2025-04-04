import type {
  CoinbaseChains,
  CosmosChains,
  AstriaChains,
  FlameNetwork,
  HexString,
} from "@repo/flame-types";

/**
 * Represents the configuration object for the application.
 */
export interface AppConfig {
  // The configurations for Cosmos chains.
  cosmosChains: CosmosChains;
  // The configurations for Astria chains.
  astriaChains: AstriaChains;
  // The configurations for Base chains.
  coinbaseChains: CoinbaseChains;
  // The selected Flame network.
  selectedFlameNetwork: FlameNetwork;
  // Function to select the Flame network.
  selectFlameNetwork: (network: FlameNetwork) => void;
  // The URL for the brand link in the navigation menu.
  brandURL: string;
  // The URL for the bridge link in the navigation menu.
  bridgeURL: string;
  // The URL for the swap link in the navigation menu.
  swapURL: string;
  // The URL for the pool link in the navigation menu.
  poolURL: string;
  // The base URL for the Morpho API.
  earnAPIURL: string;
  // The URL for the feedback form side tag. Hides side tag when null.
  feedbackFormURL?: string;
  // The URL for the swap quote API.
  swapQuoteAPIURL: string;
  // List of networks to display in the network selector.
  networksList: FlameNetwork[];
  // The default approval amount for tokens.
  tokenApprovalAmount: string;
  // The default slippage tolerance for swaps.
  swapSlippageToleranceDefault: number;
  // The fee recipient address for swaps.
  feeRecipient?: HexString;
  // Feature flags
  featureFlags: {
    earnEnabled: boolean;
    poolEnabled: boolean;
  };
}

export {
  getAllChainConfigs,
  getFlameChainId,
  getFlameNetworkByChainId,
} from "./chain-configs";
export { ConfigContextProvider } from "./contexts/config-context";
export { getEnvVariable, getOptionalEnvVariable } from "./env";
export { useConfig, useAstriaChainData } from "./hooks/use-config";
