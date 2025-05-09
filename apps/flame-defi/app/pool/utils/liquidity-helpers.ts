import Big from "big.js";

import { calculatePriceToTick } from "./pool-helpers";

/**
 * Calculates the square root ratio from a tick.
 * Uses math functions for the initial calculation since Big.js has limitations when working with fractional exponents (e.g. pow(tick / 2)).
 */
const getSqrtRatioAtTick = (tick: number): Big => {
  const price = Math.pow(1.0001, tick);
  return new Big(Math.sqrt(price));
};

/**
 * Gets the amount of token0 for a given amount of liquidity.
 */
const getAmount0FromLiquidity = (
  sqrtRatioA: Big,
  sqrtRatioB: Big,
  liquidity: Big,
): Big => {
  const [sqrtRatioLower, sqrtRatioUpper] = sqrtRatioA.lt(sqrtRatioB)
    ? [sqrtRatioA, sqrtRatioB]
    : [sqrtRatioB, sqrtRatioA];

  // Calculate amount0: amount0 = L * (1/√Pa - 1/√Pb)
  const invLower = new Big(1).div(sqrtRatioLower);
  const invUpper = new Big(1).div(sqrtRatioUpper);
  return liquidity.mul(invLower.minus(invUpper));
};

/**
 * Gets the amount of token1 for a given amount of liquidity.
 */
const getAmount1FromLiquidity = (
  sqrtRatioA: Big,
  sqrtRatioB: Big,
  liquidity: Big,
): Big => {
  const [sqrtRatioLower, sqrtRatioUpper] = sqrtRatioA.lt(sqrtRatioB)
    ? [sqrtRatioA, sqrtRatioB]
    : [sqrtRatioB, sqrtRatioA];

  // Calculate amount1: amount1 = L * (√Pb - √Pa)
  return liquidity.mul(sqrtRatioUpper.minus(sqrtRatioLower));
};

/**
 * Gets the liquidity for a given amount of token0
 */
const getLiquidityForAmount0 = (
  sqrtRatioA: Big,
  sqrtRatioB: Big,
  amount0: Big,
): Big => {
  const [sqrtRatioLower, sqrtRatioUpper] = sqrtRatioA.lt(sqrtRatioB)
    ? [sqrtRatioA, sqrtRatioB]
    : [sqrtRatioB, sqrtRatioA];

  // Calculate liquidity: L = amount0 / (1/√Pa - 1/√Pb)
  const invLower = new Big(1).div(sqrtRatioLower);
  const invUpper = new Big(1).div(sqrtRatioUpper);
  const denominator = invLower.minus(invUpper);

  return amount0.div(denominator);
};

/**
 * Gets the liquidity for a given amount of token1.
 */
const getLiquidityForAmount1 = (
  sqrtRatioA: Big,
  sqrtRatioB: Big,
  amount1: Big,
): Big => {
  const [sqrtRatioLower, sqrtRatioUpper] = sqrtRatioA.lt(sqrtRatioB)
    ? [sqrtRatioA, sqrtRatioB]
    : [sqrtRatioB, sqrtRatioA];

  // L = amount1 / (√Pb - √Pa)
  return amount1.div(sqrtRatioUpper.minus(sqrtRatioLower));
};

/**
 * Implementation of Uniswap's `getAmount0ForLiquidity`.
 */
export const getAmount0ForLiquidity = ({
  amount1,
  price,
  decimal0,
}: {
  amount1: string;
  price: number;
  decimal0: number;
}): string => {
  const amount = new Big(amount1);

  const tick = calculatePriceToTick({ price });

  // Calculate next tick (simple increment for adjacent tick).
  // Uniswap V3 doesn't care about tick spacing for uninitialized pools.
  const nextTick = tick + 1;

  const sqrtRatioLower = getSqrtRatioAtTick(tick);
  const sqrtRatioUpper = getSqrtRatioAtTick(nextTick);

  const liquidity = getLiquidityForAmount1(
    sqrtRatioLower,
    sqrtRatioUpper,
    amount,
  );

  const amount0 = getAmount0FromLiquidity(
    sqrtRatioLower,
    sqrtRatioUpper,
    liquidity,
  );

  return amount0.toFixed(decimal0);
};

/**
 * Implementation of Uniswap's `getAmount1ForLiquidity`.
 */
export const getAmount1ForLiquidity = ({
  amount0,
  price,
  decimal1,
}: {
  amount0: string;
  price: number;
  decimal1: number;
}): string => {
  const amount = new Big(amount0);

  const tick = calculatePriceToTick({ price });

  const nextTick = tick + 1;

  const sqrtRatioLower = getSqrtRatioAtTick(tick);
  const sqrtRatioUpper = getSqrtRatioAtTick(nextTick);

  const liquidity = getLiquidityForAmount0(
    sqrtRatioLower,
    sqrtRatioUpper,
    amount,
  );

  const amount1 = getAmount1FromLiquidity(
    sqrtRatioLower,
    sqrtRatioUpper,
    liquidity,
  );

  return amount1.toFixed(decimal1);
};
