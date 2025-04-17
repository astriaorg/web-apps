import type { EvmCurrency } from "@repo/flame-types";
import Big from "big.js";
import type { Slot0Data } from "features/evm-wallet";

/**
 * Implements the calculation to get the exchange rate of the pool.
 *
 * The exchange rate is calculated using the formula defined in the Uniswap V3 documentation.
 *
 * Ref: https://blog.uniswap.org/uniswap-v3-math-primer#how-do-i-calculate-the-current-exchange-rate
 */
export const getPoolExchangeRate = ({
  token0,
  token1,
  slot0,
}: {
  token0: EvmCurrency;
  token1: EvmCurrency;
  slot0: Slot0Data;
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
  const sqrtPriceX96 = new Big(slot0.sqrtPriceX96.toString());
  const decimal0 = token0.coinDecimals;
  const decimal1 = token1.coinDecimals;

  // Calculate the numerator: (sqrtPriceX96 / 2**96)**2
  const numerator = sqrtPriceX96.div(Big(2).pow(96)).pow(2);
  // Calculate the denominator: 10**Decimal1 / 10**Decimal0
  const denominator = Big(10).pow(decimal1).div(Big(10).pow(decimal0));

  const buyOneOfToken0 = numerator.div(denominator).toFixed();
  const buyOneOfToken1 = Big(1).div(buyOneOfToken0).toFixed();

  return {
    rateToken0ToToken1: buyOneOfToken0,
    rateToken1ToToken0: buyOneOfToken1,
  };
};
