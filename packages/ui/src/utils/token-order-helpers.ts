import { HexString } from "@repo/flame-types";
import { numberToBigInt } from "./number-helpers";

interface TokenAmounts {
  amount0Desired: bigint;
  amount1Desired: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
}

/**
 * Determines if token addresses need to be swapped based on Uniswap V3 requirement
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

/**
 * Calculates min amount with slippage tolerance applied
 *
 * @param amount Token amount as string
 * @param slippageTolerance Slippage tolerance percentage
 * @param coinDecimals Number of decimals for the token
 * @returns Minimum amount as bigint with slippage applied
 */
export const calculateMinAmountWithSlippage = (
  amount: string,
  slippageTolerance: number,
  coinDecimals: number,
): bigint => {
  if (!amount || isNaN(Number(amount))) return BigInt(0);
  const parsedAmount = parseFloat(amount);
  const amountWithSlippage = parsedAmount * (1 - slippageTolerance / 100);
  return numberToBigInt(amountWithSlippage, coinDecimals);
};

/**
 * Processes token amounts based on their correct order for Uniswap V3
 *
 * @param inputOne Amount of first token as string
 * @param inputTwo Amount of second token as string
 * @param token0Address Address of first token
 * @param token1Address Address of second token
 * @param token0Decimals Decimals of first token
 * @param token1Decimals Decimals of second token
 * @param slippageTolerance Slippage tolerance percentage
 * @returns Object with properly ordered token amounts
 */
export const getOrderedTokenAmounts = (
  inputOne: string,
  inputTwo: string,
  token0Address: HexString,
  token1Address: HexString,
  token0Decimals: number,
  token1Decimals: number,
  slippageTolerance: number,
): TokenAmounts => {
  // Check if tokens need to be swapped (token0 must have the lower address according to Uniswap V3)
  const shouldReverseOrder = needToReverseTokenOrder(
    token0Address,
    token1Address,
  );

  if (shouldReverseOrder) {
    // Swap input values if the tokens need to be reordered
    return {
      amount0Desired: numberToBigInt(parseFloat(inputTwo), token1Decimals),
      amount1Desired: numberToBigInt(parseFloat(inputOne), token0Decimals),
      amount0Min: calculateMinAmountWithSlippage(
        inputTwo,
        slippageTolerance,
        token1Decimals,
      ),
      amount1Min: calculateMinAmountWithSlippage(
        inputOne,
        slippageTolerance,
        token0Decimals,
      ),
    };
  } else {
    // Keep original order
    return {
      amount0Desired: numberToBigInt(parseFloat(inputOne), token0Decimals),
      amount1Desired: numberToBigInt(parseFloat(inputTwo), token1Decimals),
      amount0Min: calculateMinAmountWithSlippage(
        inputOne,
        slippageTolerance,
        token0Decimals,
      ),
      amount1Min: calculateMinAmountWithSlippage(
        inputTwo,
        slippageTolerance,
        token1Decimals,
      ),
    };
  }
};
