import { Price } from "@uniswap/sdk-core";
import {
  nearestUsableTick,
  priceToClosestTick,
  TickMath,
  tickToPrice,
} from "@uniswap/v3-sdk";
import JSBI from "jsbi";

import type { EvmCurrency } from "@repo/flame-types";
import {
  MAX_PRICE_DEFAULT,
  MIN_PRICE_DEFAULT,
} from "pool/modules/create-position/types";
import {
  DepositType,
  FEE_TIER_TICK_SPACING,
  type FeeTier,
  TICK_BOUNDARIES,
} from "pool/types";

// TODO: Remove?
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

/**
 * Calculates the nearest tick and price for a given price based on the tick spacing.
 */
export const calculateUserPriceToNearestTickAndPrice = ({
  feeTier,
  ...params
}: {
  price: number;
  token0: EvmCurrency;
  token1: EvmCurrency;
  feeTier: FeeTier;
}): {
  tick: number;
  price: string;
} => {
  if (params.price === MIN_PRICE_DEFAULT) {
    return { tick: TickMath.MIN_TICK, price: MIN_PRICE_DEFAULT.toString() };
  }
  if (params.price === MAX_PRICE_DEFAULT) {
    return { tick: TickMath.MAX_TICK, price: MAX_PRICE_DEFAULT.toString() };
  }

  const token0 = params.token0.asToken();
  const token1 = params.token1.asToken();

  const price = new Price(
    token0,
    token1,
    JSBI.BigInt(10 ** token0.decimals),
    JSBI.BigInt(Math.round(params.price * 10 ** token1.decimals)),
  );

  const tick = priceToClosestTick(price);

  const tickSpacing = FEE_TIER_TICK_SPACING[feeTier];
  const nearestTick = nearestUsableTick(tick, tickSpacing);

  const nearestPrice = tickToPrice(token0, token1, nearestTick);

  return {
    tick: nearestTick,
    price: nearestPrice.toFixed(token0.decimals),
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

/**
 * Calculates token prices and ticks for a new pool.
 */
export const calculateNewPoolPrices = (params: {
  price: number;
  token0: EvmCurrency;
  token1: EvmCurrency;
}) => {
  const token0 = params.token0.asToken();
  const token1 = params.token1.asToken();

  const price = new Price(
    token0,
    token1,
    JSBI.BigInt(10 ** token0.decimals),
    JSBI.BigInt(params.price * 10 ** token1.decimals),
  );

  const tick = priceToClosestTick(price);
  const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(tick);

  const actualPriceObj = tickToPrice(token0, token1, tick);
  const token1Price = actualPriceObj.invert().toFixed(token1.decimals);
  const token0Price = actualPriceObj.toFixed(token0.decimals);

  return {
    sqrtPriceX96: BigInt(sqrtPriceX96.toString()),
    tick,
    token0Price,
    token1Price,
  };
};
