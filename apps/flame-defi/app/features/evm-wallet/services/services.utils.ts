import { HexString } from "@repo/flame-types";

/**
 * Determines if token addresses need to be reversed based on Uniswap V3 requirement
 * that token0 must have the lower address
 *
 * @param token0Address Address of first token
 * @param token1Address Address of second token
 * @returns Boolean indicating if token order needs to be reversed
 */
export const needToReverseTokenOrder = (
  token0Address: HexString,
  token1Address: HexString,
): boolean => {
  return token0Address.toLowerCase() > token1Address.toLowerCase();
};
