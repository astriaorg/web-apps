import { Token } from "@uniswap/sdk-core";
import type { Address } from "viem";

import type { AstriaChain, EvmCurrency } from "@repo/flame-types";

/**
 * Converts an internal token instance to a Uniswap SDK token instance.
 */
export const getTokenFromInternalToken = (
  token: EvmCurrency,
  chain: AstriaChain,
): Token => {
  // Handle native tokens. If the token is native, use the wrapped native token address.
  const address = token.isNative
    ? chain.contracts.wrappedNativeToken.address
    : (token.erc20ContractAddress as Address);

  return new Token(token.chainId, address, token.coinDecimals, token.coinDenom);
};
