// TODO: Edit repetitive file name.

/**
 * Fee tiers available in Uniswap V3
 * Values are in hundredths of a basis point (1 = 0.0001%)
 */
export const FEE_TIER = {
  LOWEST: 100, // 0.01%
  LOW: 500, // 0.05%
  MEDIUM: 3000, // 0.30%
  HIGH: 10000, // 1.00%
} as const;

/**
 * Type representing valid fee tier values
 */
export type FeeTier = (typeof FEE_TIER)[keyof typeof FEE_TIER];

/**
 * Mapping of fee tiers to their corresponding tick spacing values
 * Tick spacing determines the interval between initialized ticks
 */
export const TICK_SPACING_BY_FEE: Record<FeeTier, number> = {
  [FEE_TIER.LOWEST]: 1,
  [FEE_TIER.LOW]: 10,
  [FEE_TIER.MEDIUM]: 60,
  [FEE_TIER.HIGH]: 200,
};

/**
 * Tick boundaries for Uniswap V3
 * These are the maximum and minimum tick values supported by the protocol
 */
export const TICK_BOUNDARIES = {
  MAX: 887272,
  MIN: -887272,
} as const;
