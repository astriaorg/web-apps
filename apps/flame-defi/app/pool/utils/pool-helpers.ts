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
  // We still divide by the same amount to normalize the raw price to the adjusted price, so it doesn't matter which token has more decimals.
  const denominator = new Big(10).pow(Math.abs(decimal1 - decimal0));

  const buyOneOfToken0 = numerator.div(denominator).toFixed();
  const buyOneOfToken1 = new Big(1).div(buyOneOfToken0).toFixed();

  return {
    rateToken0ToToken1: buyOneOfToken0,
    rateToken1ToToken0: buyOneOfToken1,
  };
};

export const calculatePriceToTick = ({
  price,
  decimal0,
  decimal1,
}: {
  price: number;
  decimal0: number;
  decimal1: number;
}) => {
  return Math.floor(
    Math.log(price * Math.pow(10, decimal0 - decimal1)) / Math.log(1.0001),
  );
};

export const calculateTickToPrice = ({
  tick,
  decimal0,
  decimal1,
}: {
  tick: number;
  decimal0: number;
  decimal1: number;
}) => {
  // (1.0001 ** tick) / (10 ** (Decimal1 - Decimal0))
  // Note: Docs say Decimal1 - Decimal0 but it should be decimal0 - decimal1.
  return Math.pow(1.0001, tick) / Math.pow(10, decimal0 - decimal1);
};

const calculatePriceToSqrtPriceX96 = ({
  price,
  decimal0,
  decimal1,
}: {
  price: number;
  decimal0: number;
  decimal1: number;
}) => {
  const sqrtPrice = Math.sqrt(price * Math.pow(10, decimal0 - decimal1));
  const sqrtPriceX96 = sqrtPrice * Math.pow(2, 96);

  return sqrtPriceX96;
};

const calculateNearestValidTick = ({
  tick,
  tickSpacing,
}: {
  tick: number;
  tickSpacing: number;
}) => {
  // Round the tick to the nearest valid tick based on the tick spacing.
  return Math.round(tick / tickSpacing) * tickSpacing;
};

export const calculatePriceRange = ({
  feeTier,
  decimal0,
  decimal1,
  minPrice,
  maxPrice,
}: {
  feeTier: FeeTier;
  decimal0: number;
  decimal1: number;
  minPrice: number;
  maxPrice: number;
}) => {
  const tickSpacing = FEE_TIER_TICK_SPACING[feeTier];

  const minTick = calculatePriceToTick({
    price: minPrice,
    decimal0,
    decimal1,
  });
  const maxTick = calculatePriceToTick({
    price: maxPrice,
    decimal0,
    decimal1,
  });

  const validMinTick = calculateNearestValidTick({
    tick: minTick,
    tickSpacing,
  });
  const validMaxTick = calculateNearestValidTick({
    tick: maxTick,
    tickSpacing,
  });

  const actualMinPrice = calculateTickToPrice({
    tick: validMinTick,
    decimal0,
    decimal1,
  });
  const actualMaxPrice = calculateTickToPrice({
    tick: validMaxTick,
    decimal0,
    decimal1,
  });

  const minSqrtPriceX96 = calculatePriceToSqrtPriceX96({
    price: actualMinPrice,
    decimal0,
    decimal1,
  });
  const maxSqrtPriceX96 = calculatePriceToSqrtPriceX96({
    price: actualMaxPrice,
    decimal0,
    decimal1,
  });

  return {
    minTick: validMinTick,
    maxTick: validMaxTick,
    minPrice: actualMinPrice,
    maxPrice: actualMaxPrice,
    minSqrtPriceX96,
    maxSqrtPriceX96,
  };
};
