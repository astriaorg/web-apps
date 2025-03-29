import {
  CoinbaseChains,
  CosmosChains,
  EvmChains,
  FlameNetwork,
} from "@repo/flame-types";

import * as dawn from "./chain-configs-dawn";
import * as dusk from "./chain-configs-dusk";
import * as local from "./chain-configs-local";
import * as mainnet from "./chain-configs-mainnet";

export interface ChainConfigsObject {
  evmChains: EvmChains;
  cosmosChains: CosmosChains;
  coinbaseChains: CoinbaseChains;
}

export type FlameNetworkConfig = ChainConfigsObject & {
  name: FlameNetwork;
}

export type NetworkConfigs = Record<FlameNetwork, FlameNetworkConfig>;

const NETWORK_CONFIGS: NetworkConfigs = {
  [FlameNetwork.LOCAL]: {
    name: FlameNetwork.LOCAL,
    evmChains: local.evmChains,
    cosmosChains: local.cosmosChains,
    coinbaseChains: local.coinbaseChains,
  },
  [FlameNetwork.DUSK]: {
    name: FlameNetwork.DUSK,
    evmChains: dusk.evmChains,
    cosmosChains: dusk.cosmosChains,
    coinbaseChains: dusk.coinbaseChains,
  },
  [FlameNetwork.DAWN]: {
    name: FlameNetwork.DAWN,
    evmChains: dawn.evmChains,
    cosmosChains: dawn.cosmosChains,
    coinbaseChains: dawn.coinbaseChains,
  },
  [FlameNetwork.MAINNET]: {
    name: FlameNetwork.MAINNET,
    evmChains: mainnet.evmChains,
    cosmosChains: mainnet.cosmosChains,
    coinbaseChains: mainnet.coinbaseChains,
  },
};

/**
 * Gets the chain ID for a Flame network.
 */
export function getFlameChainId(network: FlameNetwork): number {
  const config = NETWORK_CONFIGS[network];
  const evmChain = Object.values(config.evmChains)[0];
  if (!evmChain) {
    throw new Error(`No EVM chain found for network ${network}`);
  }
  return evmChain.chainId;
}

/**
 * Gets the Flame network for a chain ID.
 */
export function getFlameNetworkByChainId(chainId: number): FlameNetwork {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const network = Object.entries(NETWORK_CONFIGS).find(([_, config]) => {
    const evmChain = Object.values(config.evmChains)[0];
    return evmChain && evmChain.chainId === chainId;
  });

  if (!network) {
    throw new Error(`No Flame network found for chain ID ${chainId}`);
  }

  return network[0] as FlameNetwork;
}

/**
 * Gets chain configurations for the specified network.
 * Falls back to local network config if specified network is not found.
 */
export function getChainConfigs(network: FlameNetwork): FlameNetworkConfig {
  return NETWORK_CONFIGS[network] || NETWORK_CONFIGS[FlameNetwork.LOCAL];
}

/**
 * Gets all chain configurations.
 * Returns merged configurations to maintain compatibility with existing code.
 */
export function getAllChainConfigs(): ChainConfigsObject {
  const evmChains: EvmChains = {};
  const cosmosChains: CosmosChains = {};
  const coinbaseChains: CoinbaseChains = {};

  for (const config of Object.values(NETWORK_CONFIGS)) {
    Object.assign(evmChains, config.evmChains);
    Object.assign(cosmosChains, config.cosmosChains);
    Object.assign(coinbaseChains, config.coinbaseChains);
  }

  return {
    evmChains,
    cosmosChains,
    coinbaseChains,
  };
}
