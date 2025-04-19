import {
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";

/**
 * Represents the selection of a blockchain chain, currency, and address.
 */
export interface ChainConnection {
  chain: EvmChainInfo | CosmosChainInfo | null;
  currency: EvmCurrency | IbcCurrency | null;
  address: string | null;
  isConnected: boolean;
}
