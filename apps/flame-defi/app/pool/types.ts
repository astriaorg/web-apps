import type { Address } from "viem";

/**
 * Fee tiers available in Uniswap V3.
 * Values are in hundredths of a basis point (1 = 0.0001%).
 */
export const FEE_TIER = {
  LOWEST: 100, // 0.01%
  LOW: 500, // 0.05%
  MEDIUM: 3000, // 0.30%
  HIGH: 10000, // 1.00%
} as const;

export const FEE_TIERS = [
  FEE_TIER.LOWEST,
  FEE_TIER.LOW,
  FEE_TIER.MEDIUM,
  FEE_TIER.HIGH,
];

/**
 * Returns the same values as "tickSpacing" in the contract, hard-code since these values are fixed.
 */
export const FEE_TIER_TICK_SPACING: { [key in FeeTier]: number } = {
  [FEE_TIER.LOWEST]: 1,
  [FEE_TIER.LOW]: 10,
  [FEE_TIER.MEDIUM]: 60,
  [FEE_TIER.HIGH]: 200,
};

export type FeeTier = (typeof FEE_TIER)[keyof typeof FEE_TIER];

/**
 * Mapping of fee tiers to their corresponding tick spacing values.
 * Tick spacing determines the interval between initialized ticks.
 * @deprecated Use `FEE_TIER_TICK_SPACING` instead.
 */
export const TICK_SPACING_BY_FEE_TIER: Record<FeeTier, number> = {
  [FEE_TIER.LOWEST]: 1,
  [FEE_TIER.LOW]: 10,
  [FEE_TIER.MEDIUM]: 60,
  [FEE_TIER.HIGH]: 200,
};

export enum InputId {
  INPUT_0 = "INPUT_0",
  INPUT_1 = "INPUT_1",
}

export const MIN_PRICE_DEFAULT = 0;
export const MAX_PRICE_DEFAULT = Infinity;

/**
 * Tick boundaries for Uniswap V3.
 *
 * These are the maximum and minimum tick values supported by the protocol.
 *
 * @deprecated Use `TickMath.MIN_TICK` and `TickMath.MAX_TICK` instead.
 */
export const TICK_BOUNDARIES = {
  MAX: 887272,
  MIN: -887272,
} as const;

export enum DepositType {
  TOKEN_0_ONLY = "TOKEN_0_ONLY",
  TOKEN_1_ONLY = "TOKEN_1_ONLY",
  BOTH = "BOTH",
}

export interface Position {
  nonce: bigint;
  operator: string;
  token0: Address;
  token1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
}

export interface PositionWithPositionId extends Position {
  /**
   * Unique identifier for the position.
   *
   * The position's ID, also called `key` or `tokenId` in the contract, is a hash of a preimage composed by the `owner`, `tickLower` and `tickUpper`.
   */
  positionId: string;
}
