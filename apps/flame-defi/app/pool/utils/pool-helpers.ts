import {
  DepositType,
  FEE_TIER_TICK_SPACING,
  type FeeTier,
  TICK_BOUNDARIES,
} from "pool/types";

export const calculatePriceToTick = ({
  price,
  decimal0,
  decimal1,
}: {
  price: number;
  decimal0?: number;
  decimal1?: number;
}) => {
  let tick: number = 0;

  if (decimal0 && decimal1) {
    tick = Math.floor(
      Math.log(price * Math.pow(10, decimal0 - decimal1)) / Math.log(1.0001),
    );
  } else {
    tick = Math.floor(Math.log(price) / Math.log(1.0001));
  }

  if (tick < TICK_BOUNDARIES.MIN) {
    return TICK_BOUNDARIES.MIN;
  }
  if (tick > TICK_BOUNDARIES.MAX) {
    return TICK_BOUNDARIES.MAX;
  }

  return tick;
};

export const calculateTickToPrice = ({
  tick,
  decimal0,
  decimal1,
}: {
  tick: number;
  decimal0?: number;
  decimal1?: number;
}) => {
  // (1.0001 ** tick) / (10 ** (Decimal1 - Decimal0))
  // Note: Docs say Decimal1 - Decimal0 but it should be decimal0 - decimal1.
  const price = Math.pow(1.0001, tick);

  if (decimal0 && decimal1) {
    return price / Math.pow(10, decimal0 - decimal1);
  }

  return price;
};

export const calculatePriceToSqrtPriceX96 = ({
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

/**
 * Calculates the nearest valid tick for a given tick lower or upper bound.
 *
 * Rounding behavior:
 * - For positive ticks: Always round DOWN to the nearest multiple of `tickSpacing`.
 * - For negative ticks: Always round UP (toward zero) to the nearest multiple of `tickSpacing`.
 *
 * This matches the implementation in the contract.
 */
export const calculateNearestValidTick = ({
  tick,
  tickSpacing,
}: {
  tick: number;
  tickSpacing: number;
}): number => {
  // For negative ticks, round toward zero (ceil)
  // For positive ticks, round down (floor)
  return tick < 0
    ? Math.ceil(tick / tickSpacing) * tickSpacing
    : Math.floor(tick / tickSpacing) * tickSpacing;
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

export const calculateDepositType = ({
  currentPrice,
  minPrice,
  maxPrice,
  decimal0,
  decimal1,
}: {
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  decimal0?: number;
  decimal1?: number;
}) => {
  let minTick = calculatePriceToTick({ price: minPrice, decimal0, decimal1 });
  let maxTick = calculatePriceToTick({ price: maxPrice, decimal0, decimal1 });

  if (minTick < TICK_BOUNDARIES.MIN) {
    minTick = TICK_BOUNDARIES.MIN;
  }
  if (maxTick > TICK_BOUNDARIES.MAX) {
    maxTick = TICK_BOUNDARIES.MAX;
  }

  const currentTick = calculatePriceToTick({
    price: currentPrice,
    decimal0,
    decimal1,
  });

  if (currentTick < minTick) {
    return DepositType.TOKEN_1_ONLY;
  }
  if (currentTick > maxTick) {
    return DepositType.TOKEN_0_ONLY;
  }

  return DepositType.BOTH;
};
