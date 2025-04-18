import {
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";

/**
 * Represents the selection of a blockchain chain, currency, and address.
 */
export interface ChainSelection {
  chain: EvmChainInfo | CosmosChainInfo | null;
  currency: EvmCurrency | IbcCurrency | null;
  address: string | null;
}

/**
 * Represents a connection in a chain, extending functionality from ChainSelection.
 *
 * This interface defines a ChainConnection type with a property isConnected to indicate
 * whether the connection is established or not.
 */
export interface ChainConnection extends ChainSelection {
  isConnected: boolean;
}
