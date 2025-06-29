import { Percent, Price } from "@uniswap/sdk-core";
import {
  nearestUsableTick,
  type Pool,
  Position,
  priceToClosestTick,
  SqrtPriceMath,
  TickMath,
  tickToPrice,
} from "@uniswap/v3-sdk";
import Big from "big.js";
import JSBI from "jsbi";
import { type Address, formatUnits } from "viem";

import { type EvmCurrency, TokenAmount } from "@repo/flame-types";
import {
  DepositType,
  FEE_TIER,
  FEE_TIER_TICK_SPACING,
  type FeeTier,
  MAX_PRICE_DEFAULT,
  MIN_PRICE_DEFAULT,
  type Position as InternalPosition,
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

  if (tick < TickMath.MIN_TICK) {
    return TickMath.MIN_TICK;
  }
  if (tick > TickMath.MAX_TICK) {
    return TickMath.MAX_TICK;
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
 * Calculates the nearest tick and price for a given user price based on the fee tier.
 */
export const calculateNearestTickAndPrice = ({
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

  if (minTick < TickMath.MIN_TICK) {
    minTick = TickMath.MIN_TICK;
  }
  if (maxTick > TickMath.MAX_TICK) {
    maxTick = TickMath.MAX_TICK;
  }

  const currentTick = calculatePriceToTick({
    price: currentPrice,
    decimal0,
    decimal1,
  });

  if (currentTick < minTick) {
    return DepositType.TOKEN_0_ONLY;
  }
  if (currentTick > maxTick) {
    return DepositType.TOKEN_1_ONLY;
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

  const nearestPrice = tickToPrice(token0, token1, tick);
  const token1Price = nearestPrice.invert().toFixed(token1.decimals);
  const token0Price = nearestPrice.toFixed(token0.decimals);

  return {
    sqrtPriceX96: BigInt(sqrtPriceX96.toString()),
    tick,
    token0Price,
    token1Price,
  };
};

export const calculateTokenAmountsFromPosition = ({
  position,
  token0,
  token1,
  ...params
}: {
  position: InternalPosition;
  sqrtPriceX96: bigint;
  token0: EvmCurrency;
  token1: EvmCurrency;
}): { amount0: string; amount1: string } => {
  const sqrtPriceX96 = JSBI.BigInt(params.sqrtPriceX96.toString());
  const sqrtPriceLowerX96 = TickMath.getSqrtRatioAtTick(position.tickLower);
  const sqrtPriceUpperX96 = TickMath.getSqrtRatioAtTick(position.tickUpper);

  const liquidity = JSBI.BigInt(position.liquidity.toString());

  let amount0 = JSBI.BigInt(0);
  let amount1 = JSBI.BigInt(0);

  if (JSBI.lessThan(sqrtPriceX96, sqrtPriceLowerX96)) {
    // Current price is below position range - only token0.
    amount0 = SqrtPriceMath.getAmount0Delta(
      sqrtPriceLowerX96,
      sqrtPriceUpperX96,
      liquidity,
      false,
    );
  } else if (JSBI.greaterThanOrEqual(sqrtPriceX96, sqrtPriceUpperX96)) {
    // Current price is above position range - only token1.
    amount1 = SqrtPriceMath.getAmount1Delta(
      sqrtPriceLowerX96,
      sqrtPriceUpperX96,
      liquidity,
      false,
    );
  } else {
    // Current price is within position range - both tokens.
    amount0 = SqrtPriceMath.getAmount0Delta(
      sqrtPriceX96,
      sqrtPriceUpperX96,
      liquidity,
      false,
    );
    amount1 = SqrtPriceMath.getAmount1Delta(
      sqrtPriceLowerX96,
      sqrtPriceX96,
      liquidity,
      false,
    );
  }

  return {
    // Don't use JSBI for the final division. JSBI does integer division, so precision is lost for small amounts and 0 is returned.
    amount0: formatUnits(BigInt(amount0.toString()), token0.coinDecimals),
    amount1: formatUnits(BigInt(amount1.toString()), token1.coinDecimals),
  };
};

/**
 * Get the min and max tick for a given fee tier.
 */
export const getMinMaxTick = (feeTier: FeeTier) => {
  const feeTiers = Object.values(FEE_TIER) as number[];
  const tickSpacing = feeTiers.includes(feeTier)
    ? FEE_TIER_TICK_SPACING[feeTier]
    : 1;

  const minTick = nearestUsableTick(TickMath.MIN_TICK, tickSpacing);
  const maxTick = nearestUsableTick(TickMath.MAX_TICK, tickSpacing);

  return { minTick, maxTick };
};

export const getDisplayMinPrice = (
  minPrice: string,
  options: {
    minimumFractionDigits?: number;
  } = {},
) => {
  if (!minPrice) {
    return minPrice;
  }
  return Number(minPrice) === MIN_PRICE_DEFAULT
    ? "0"
    : new Big(minPrice).toFixed(options.minimumFractionDigits);
};

export const getDisplayMaxPrice = (
  maxPrice: string,
  options: {
    minimumFractionDigits?: number;
  } = {},
) => {
  if (!maxPrice) {
    return maxPrice;
  }
  return Number(maxPrice) === MAX_PRICE_DEFAULT
    ? "∞"
    : new Big(maxPrice).toFixed(options.minimumFractionDigits);
};

export const getIncreaseLiquidityAmounts = ({
  amount0,
  amount1,
  token0,
  token1,
  depositType,
  slippageTolerance,
}: {
  amount0: string;
  amount1: string;
  token0: EvmCurrency;
  token1: EvmCurrency;
  depositType: DepositType;
  slippageTolerance: number;
}): {
  amount0Desired: bigint;
  amount1Desired: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  deadline: number;
} => {
  amount0 = depositType === DepositType.TOKEN_1_ONLY ? "0" : amount0;
  amount1 = depositType === DepositType.TOKEN_0_ONLY ? "0" : amount1;

  const calculateAmount = (
    amount: string,
    token: EvmCurrency,
  ): { amountDesired: bigint; amountMin: bigint } => {
    // If desired is 0, min must be 0.
    if (amount === "0") {
      return {
        amountDesired: 0n,
        amountMin: 0n,
      };
    }

    const amountDesired = TokenAmount.fromArgs(
      token.chainId,
      token.asToken().address as Address,
      token.coinDecimals,
      token.coinDenom,
      amount,
    );

    const amountMin = amountDesired.withSlippage(slippageTolerance, true);

    return {
      amountDesired: amountDesired.toBigInt(),
      // Ensure minimum is at least 1 if desired > 1.
      amountMin: amountDesired.toBigInt() > 1n ? amountMin.toBigInt() : 1n,
    };
  };

  const { amountMin: amount0Min, amountDesired: amount0Desired } =
    calculateAmount(amount0, token0);
  const { amountMin: amount1Min, amountDesired: amount1Desired } =
    calculateAmount(amount1, token1);

  // 20 minute deadline.
  // TODO: Add this to settings.
  const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

  return {
    amount0Desired,
    amount1Desired,
    amount0Min,
    amount1Min,
    deadline,
  };
};

export const getDecreaseLiquidityAmounts = ({
  pool,
  position,
  liquidity,
  slippageTolerance,
}: {
  pool: Pool;
  position: InternalPosition;
  liquidity: bigint;
  slippageTolerance: number;
}) => {
  // 20 minute deadline.
  // TODO: Add this to settings.
  const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

  const { amount0, amount1 } = new Position({
    pool,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: liquidity.toString(),
  }).burnAmountsWithSlippage(new Percent(slippageTolerance * 100, 100 * 100));

  return {
    amount0: BigInt(amount0.toString()),
    amount1: BigInt(amount1.toString()),
    deadline,
  };
};
