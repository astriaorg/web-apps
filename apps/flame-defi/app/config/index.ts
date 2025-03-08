import { CosmosChains, EvmChains, FlameNetwork } from "@repo/flame-types";

/**
 * Represents the configuration object for the application.
 */
export interface AppConfig {
  // The configurations for Cosmos chains.
  cosmosChains: CosmosChains;
  // The configurations for EVM chains.
  evmChains: EvmChains;
  // The selected Flame network.
  selectedFlameNetwork: FlameNetwork;
  // Function to select the Flame network.
  selectFlameNetwork: (network: FlameNetwork) => void;
  // The URL for the brand link in the navbar.
  brandURL: string;
  // The URL for the bridge link in the navbar.
  bridgeURL: string;
  // The URL for the swap link in the navbar.
  swapURL: string;
  // The URL for the pool link in the navbar.
  poolURL: string;
  // The base URL for the Morpho API.
  earnAPIURL: string;
  // The URL for the feedback form side tag. Hides side tag when null.
  feedbackFormURL: string | null;
  // List of networks to display in the network selector.
  networksList: FlameNetwork[];
  // The default approval amount for tokens.
  tokenApprovalAmount: string;
  // The default slippage tolerance for swaps.
  swapSlippageToleranceDefault: number;
  // The data for the fee options.
  // TODO - replace with FeeData type after it's moved to flame-types package
  feeData: {
    id: number;
    feePercent: string;
    text: string;
    tvl: string;
    selectPercent: string;
  }[];
  // Feature flags
  featureFlags: {
    earnEnabled: boolean;
  };
}

export { ConfigContextProvider } from "./contexts/config-context";
export {
  getAllChainConfigs,
  getFlameChainId,
  getFlameNetworkByChainId,
} from "./chain-configs";
export { getEnvVariable, getOptionalEnvVariable } from "./env";
export { useConfig, useEvmChainData } from "./hooks/use-config";
