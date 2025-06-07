import {
  AstriaChains,
  CosmosChainInfo,
  CosmosChains,
  EvmChainInfo,
  FlameNetwork,
} from "@repo/flame-types";

import * as dawn from "./chain-configs-dawn";
import * as dusk from "./chain-configs-dusk";
import * as mainnet from "./chain-configs-mainnet";

export interface ChainConfigsObject {
  astriaChains: AstriaChains;
  cosmosChains: CosmosChains;
}

export type FlameNetworkConfig = ChainConfigsObject & {
  name: FlameNetwork;
};

export type NetworkConfigs = Record<FlameNetwork, FlameNetworkConfig>;

const NETWORK_CONFIGS: NetworkConfigs = {
  [FlameNetwork.DUSK]: {
    name: FlameNetwork.DUSK,
    astriaChains: dusk.astriaChains,
    cosmosChains: dusk.cosmosChains,
  },
  [FlameNetwork.DAWN]: {
    name: FlameNetwork.DAWN,
    astriaChains: dawn.astriaChains,
    cosmosChains: dawn.cosmosChains,
  },
  [FlameNetwork.MAINNET]: {
    name: FlameNetwork.MAINNET,
    astriaChains: mainnet.astriaChains,
    cosmosChains: mainnet.cosmosChains,
  },
};

/**
 * Gets chain configurations for the specified network.
 * Falls back to dusk network config if specified network is not found.
 */
export function getChainConfigs(network: FlameNetwork): FlameNetworkConfig {
  return NETWORK_CONFIGS[network] || NETWORK_CONFIGS[FlameNetwork.DUSK];
}

/**
 * Gets all chain configurations for every network (dusk, dawn, mainnet, devnets, testnets, etc.)
 *
 * This function would not be necessary if we refactored the providers
 * to be defined at a layer below the config provider.
 */
export function getAllChainConfigs(): {
  astriaChains: EvmChainInfo[];
  cosmosChains: CosmosChainInfo[];
} {
  const astriaChains: EvmChainInfo[] = [];
  const cosmosChains: CosmosChainInfo[] = [];

  for (const config of Object.values(NETWORK_CONFIGS)) {
    astriaChains.push(...Object.values(config.astriaChains));
    cosmosChains.push(...Object.values(config.cosmosChains));
  }

  return {
    astriaChains,
    cosmosChains,
  };
}
