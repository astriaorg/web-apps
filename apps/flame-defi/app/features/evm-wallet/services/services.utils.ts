import { type Address } from "viem";

import type { AstriaChain, EvmCurrency } from "@repo/flame-types";

/**
 * Determines if token addresses need to be reversed based on Uniswap V3 requirement
 * that token0 must have the lower address
 *
 * @param token0Address Address of first token
 * @param token1Address Address of second token
 * @returns Boolean indicating if token order needs to be reversed
 * @deprecated Use `shouldReverseTokenOrder` instead.
 */
export const needToReverseTokenOrder = (
  token0Address: Address,
  token1Address: Address,
): boolean => {
  return token0Address.toLowerCase() > token1Address.toLowerCase();
};

/**
 * Determines if two tokens need reversing based on Uniswap’s token ordering convention.
 * Tokens are sorted by addresses, with the smaller address first, except for WETH.
 * A wrapped native token is always the first token in a pair.
 */
export const shouldReverseTokenOrder = ({
  tokenA,
  tokenB,
  chain,
}: {
  tokenA: EvmCurrency;
  tokenB: EvmCurrency;
  chain: AstriaChain;
}): boolean => {
  const tokenAAddress = tokenA.isNative
    ? chain.contracts.wrappedNativeToken.address
    : (tokenA.erc20ContractAddress as Address);
  const tokenBAddress = tokenB.isNative
    ? chain.contracts.wrappedNativeToken.address
    : (tokenB.erc20ContractAddress as Address);

  const addressA = tokenAAddress.toLowerCase();
  const addressB = tokenBAddress.toLowerCase();

  // If one of the tokens is a wrapped native token, it should always come first.
  const isTokenAWrappedNative = tokenA.isWrappedNative;
  const isTokenBWrappedNative = tokenB.isWrappedNative;

  if (isTokenAWrappedNative && !isTokenBWrappedNative) {
    return false;
  }

  if (!isTokenAWrappedNative && isTokenBWrappedNative) {
    return true;
  }

  // For non-WETH cases, compare addresses lexicographically.
  return addressA > addressB;
};

/**
 * A Math.max function for BigInt values.
 */
export const getMaxBigInt = (a: bigint, b: bigint): bigint => (a > b ? a : b);
