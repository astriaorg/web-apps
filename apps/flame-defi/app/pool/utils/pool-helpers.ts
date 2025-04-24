import Big from "big.js";
import { FEE_TIER_TICK_SPACING, type FeeTier } from "pool/constants";

/**
 * Implements the calculation to get the exchange rate of the pool.
 *
 * The exchange rate is calculated using the formula defined in the Uniswap V3 documentation.
 *
 * Ref: https://blog.uniswap.org/uniswap-v3-math-primer#how-do-i-calculate-the-current-exchange-rate
 */
export const calculatePoolExchangeRate = ({
  decimal0,
  decimal1,
  sqrtPriceX96,
}: {
  decimal0: number;
  decimal1: number;
  sqrtPriceX96: bigint;
}): {
  /**
   * 1 Token 0 = _ Token 1
   */
  rateToken0ToToken1: string;
  /**
   * 1 Token 1 = _ Token 0
   */
  rateToken1ToToken0: string;
} => {
  // Calculate the numerator: (sqrtPriceX96 / 2**96)**2
  const numerator = new Big(sqrtPriceX96.toString())
    .div(new Big(2).pow(96))
    .pow(2);
  // Calculate the denominator: 10**Decimal1 / 10**Decimal0
  // const denominator = new Big(10).pow(decimal1 - decimal0);
  const denominator = new Big(10 ** Math.abs(decimal1 - decimal0));

  const buyOneOfToken0 = new Big(numerator).div(denominator).toFixed();
  const buyOneOfToken1 = new Big(1).div(buyOneOfToken0).toFixed();

  return {
    rateToken0ToToken1: buyOneOfToken0,
    rateToken1ToToken0: buyOneOfToken1,
  };
};

/**
 * Calculates the price of token0 in terms of token1 and vice versa using the tick value.
 */
export const calculateTickToPrice = ({
  tick,
  decimal0,
  decimal1,
}: {
  tick: number;
  decimal0: number;
  decimal1: number;
}): {
  priceToken0ToToken1: number;
  priceToken1ToToken0: number;
} => {
  // Calculate price0: (1.0001 ** tick) / (10 ** (Decimal1 - Decimal0))
  const price0 = Math.pow(1.0001, tick) / Math.pow(10, decimal1 - decimal0);

  // Calculate price1: 1 / price0
  const price1 = 1 / price0;

  return {
    priceToken0ToToken1: price0,
    priceToken1ToToken0: price1,
  };
};
