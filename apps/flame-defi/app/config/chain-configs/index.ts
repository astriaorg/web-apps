import {
  CoinbaseChains,
  CosmosChains,
  AstriaChains,
  FlameNetwork,
  EvmChainInfo,
  CosmosChainInfo,
} from "@repo/flame-types";

import * as dawn from "./chain-configs-dawn";
import * as dusk from "./chain-configs-dusk";
import * as local from "./chain-configs-local";
import * as mainnet from "./chain-configs-mainnet";

export interface ChainConfigsObject {
  astriaChains: AstriaChains;
  cosmosChains: CosmosChains;
  coinbaseChains: CoinbaseChains;
}

export type FlameNetworkConfig = ChainConfigsObject & {
  name: FlameNetwork;
};

export type NetworkConfigs = Record<FlameNetwork, FlameNetworkConfig>;

const NETWORK_CONFIGS: NetworkConfigs = {
  [FlameNetwork.LOCAL]: {
    name: FlameNetwork.LOCAL,
    astriaChains: local.astriaChains,
    cosmosChains: local.cosmosChains,
    coinbaseChains: local.coinbaseChains,
  },
  [FlameNetwork.DUSK]: {
    name: FlameNetwork.DUSK,
    astriaChains: dusk.astriaChains,
    cosmosChains: dusk.cosmosChains,
    coinbaseChains: dusk.coinbaseChains,
  },
  [FlameNetwork.DAWN]: {
    name: FlameNetwork.DAWN,
    astriaChains: dawn.astriaChains,
    cosmosChains: dawn.cosmosChains,
    coinbaseChains: dawn.coinbaseChains,
  },
  [FlameNetwork.MAINNET]: {
    name: FlameNetwork.MAINNET,
    astriaChains: mainnet.astriaChains,
    cosmosChains: mainnet.cosmosChains,
    coinbaseChains: mainnet.coinbaseChains,
  },
};

/**
 * Gets chain configurations for the specified network.
 * Falls back to local network config if specified network is not found.
 */
export function getChainConfigs(network: FlameNetwork): FlameNetworkConfig {
  return NETWORK_CONFIGS[network] || NETWORK_CONFIGS[FlameNetwork.LOCAL];
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
  coinbaseChains: EvmChainInfo[];
} {
  const astriaChains: EvmChainInfo[] = [];
  const cosmosChains: CosmosChainInfo[] = [];
  const coinbaseChains: EvmChainInfo[] = [];

  for (const config of Object.values(NETWORK_CONFIGS)) {
    astriaChains.push(...Object.values(config.astriaChains));
    cosmosChains.push(...Object.values(config.cosmosChains));
    coinbaseChains.push(...Object.values(config.coinbaseChains));
  }

  return {
    astriaChains,
    cosmosChains,
    coinbaseChains,
  };
}
