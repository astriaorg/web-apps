import {
  getAllChainConfigs,
  getFlameChainId,
  getFlameNetworkByChainId,
} from "./chainConfigs";
import { ConfigContextProvider } from "./contexts/ConfigContext";
import { getEnvVariable } from "./env";
import { useConfig } from "./hooks/useConfig";
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
  // The URL for the feedback form side tag. Hides side tag when null.
  feedbackFormURL: string | null;
  // List of networks to display in the network selector.
  networksList: FlameNetwork[];
}

export {
  ConfigContextProvider,
  getEnvVariable,
  getAllChainConfigs,
  getFlameChainId,
  getFlameNetworkByChainId,
  useConfig,
};
