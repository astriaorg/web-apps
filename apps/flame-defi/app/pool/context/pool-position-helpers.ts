import { type Address } from "viem";

import { EvmCurrency } from "@repo/flame-types";

import {
  FEE_TIER,
  type Position,
  TICK_BOUNDARIES,
  TICK_SPACING_BY_FEE_TIER,
} from "../types";

export const sqrtPriceX96ToPrice = (
  sqrtPriceX96: bigint,
  invert: boolean = false,
  token0Decimals?: number,
  token1Decimals?: number,
): number => {
  // Convert sqrtPriceX96 to decimal
  const sqrtPriceDecimal = Number(sqrtPriceX96) / 2 ** 96;

  // Square it to get the raw price
  const rawPrice = sqrtPriceDecimal * sqrtPriceDecimal;

  // Adjust for token decimal differences if decimals are provided
  let adjustedPrice = rawPrice;
  if (token0Decimals !== undefined && token1Decimals !== undefined) {
    // Formula: price * 10^(token0.decimals - token1.decimals)
    adjustedPrice = rawPrice * Math.pow(10, token0Decimals - token1Decimals);
  }

  // Return either direct price (token1/token0) or inverted price (token0/token1)
  return invert ? 1 / adjustedPrice : adjustedPrice;
};

export const tickToPrice = (
  tick: number,
  token0Decimals?: number,
  token1Decimals?: number,
): number => {
  // Calculate the raw price from tick
  const rawPrice = 1.0001 ** tick;

  // Adjust for token decimal differences if provided
  if (token0Decimals !== undefined && token1Decimals !== undefined) {
    // Formula: price * 10^(token0.decimals - token1.decimals)
    return rawPrice * Math.pow(10, token0Decimals - token1Decimals);
  }

  return rawPrice;
};

export const getTokenDataFromCurrencies = (
  currencies: EvmCurrency[],
  tokenAddress: string,
  wrappedNative: Address,
): EvmCurrency | null => {
  // NOTE: This check is required because the tokenAddress returned from the contract is WTIA but TIA is the native token and the only one we want to show.
  if (tokenAddress === wrappedNative) {
    return currencies.find((currency) => currency.isNative) || null;
  }

  return (
    currencies.find(
      (currency) => currency.erc20ContractAddress === tokenAddress,
    ) || null
  );
};

export const getMinMaxTick = (
  fee: number,
): { MIN_TICK: number; MAX_TICK: number } => {
  // Check if the fee matches any of our defined fee tiers
  const feeTiers = Object.values(FEE_TIER) as number[];
  const tickSpacing = feeTiers.includes(fee)
    ? TICK_SPACING_BY_FEE_TIER[fee as keyof typeof TICK_SPACING_BY_FEE_TIER]
    : 1;

  // Min and max ticks are derived from tick spacing
  // This matches Uniswap V3's approach for determining full range positions
  const MIN_TICK = Math.ceil(TICK_BOUNDARIES.MIN / tickSpacing) * tickSpacing;
  const MAX_TICK = Math.floor(TICK_BOUNDARIES.MAX / tickSpacing) * tickSpacing;

  return { MIN_TICK, MAX_TICK };
};

export const getTokensLiquidityAmounts = (
  position: Position,
  sqrtPriceX96: bigint,
  token0Decimals: number,
  token1Decimals: number,
): { amount0: number; amount1: number } => {
  const TICK_BASE = 1.0001; // NOTE: each tick represents a 0.01% (or 1.0001x) price change. This is a fundamental constant in the Uniswap V3 design.
  // Convert sqrtPrice to decimal form
  const sqrtPriceCurrent = Number(sqrtPriceX96) / 2 ** 96;

  // Calculate sqrt prices at the lower and upper ticks
  const sqrtPriceLower = TICK_BASE ** (position.tickLower / 2);
  const sqrtPriceUpper = TICK_BASE ** (position.tickUpper / 2);

  let amount0 = 0;
  let amount1 = 0;

  // Position is below current price: only token1
  if (sqrtPriceLower >= sqrtPriceCurrent) {
    amount1 = Number(position.liquidity) * (sqrtPriceUpper - sqrtPriceLower);
  }
  // Position is above current price: only token0
  else if (sqrtPriceUpper <= sqrtPriceCurrent) {
    amount0 =
      Number(position.liquidity) * (1 / sqrtPriceLower - 1 / sqrtPriceUpper);
  }
  // Position straddles current price: both tokens
  else {
    amount0 =
      Number(position.liquidity) * (1 / sqrtPriceCurrent - 1 / sqrtPriceUpper);
    amount1 = Number(position.liquidity) * (sqrtPriceCurrent - sqrtPriceLower);
  }

  // Adjust for token decimals
  const adjustedAmount0 = amount0 / 10 ** token0Decimals;
  const adjustedAmount1 = amount1 / 10 ** token1Decimals;

  return { amount0: adjustedAmount0, amount1: adjustedAmount1 };
};
