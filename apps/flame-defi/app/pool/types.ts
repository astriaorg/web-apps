import type { Address, Hash } from "viem";

import { EvmCurrency, TokenInputState, TXN_STATUS } from "@repo/flame-types";
import type { Slot0 } from "features/evm-wallet";

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

/**
 * Tick boundaries for Uniswap V3.
 *
 * These are the maximum and minimum tick values supported by the protocol.
 */
export const TICK_BOUNDARIES = {
  MAX: 887272,
  MIN: -887272,
} as const;

export type PoolWithSlot0 = Slot0 & {
  address: string;
  rateToken0ToToken1: string;
  rateToken1ToToken0: string;
};

export enum DepositType {
  TOKEN_0_ONLY = "TOKEN_0_ONLY",
  TOKEN_1_ONLY = "TOKEN_1_ONLY",
  BOTH = "BOTH",
}

// TODO: Remove these once we clean up existing pages.

export enum POOL_INPUT_ID {
  INPUT_ZERO = "input_zero",
  INPUT_ONE = "input_one",
}
export interface AddLiquidityInputsBlockProps {
  input0: string;
  input1: string;
  handleInputChange: (
    value: string,
    id: POOL_INPUT_ID,
    coinDecimals?: number,
  ) => void;
  token0?: EvmCurrency;
  token1?: EvmCurrency;
  token0Balance: {
    value: string;
    symbol: string;
  } | null;
  token1Balance: {
    value: string;
    symbol: string;
  } | null;
}
export interface NewPositionInputsProps {
  input0: TokenInputState;
  input1: TokenInputState;
  setInput0: (value: TokenInputState) => void;
  setInput1: (value: TokenInputState) => void;
  currencies: EvmCurrency[];
}

export interface TokenPair {
  token0: EvmCurrency | null;
  token1: EvmCurrency | null;
}

export interface FeeData {
  id: number;
  feeTier: FeeTier;
  text: string;
  tvl: string;
  selectPercent: string;
}

export interface PriceRangeCardProps {
  leftLabel: string;
  value: string | number;
  rightLabel?: string;
  tooltipText?: string;
  className?: string;
  variant?: "default" | "small";
}

export interface PoolToken {
  unclaimedFees: number;
  liquidity: number;
  liquidityPercentage: number;
  token: EvmCurrency;
}

export interface PoolPositionResponse {
  nonce: bigint;
  operator: string;
  tokenAddress0: Address;
  tokenAddress1: Address;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
}

export interface GetAllPoolPositionsResponse extends PoolPositionResponse {
  tokenId: string;
}

export interface PoolPosition extends GetAllPoolPositionsResponse {
  feePercent: FeeTier;
  inRange: boolean;
  positionStatus: string;
  poolAddress: Address | null;
  symbolOne: string;
  symbolTwo: string;
}

export type PoolContextProps = {
  poolPositions: PoolPosition[];
  poolPositionsLoading: boolean;
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
  maxPrice: string;
  updateMaxPrice: (
    feeTier: number,
    token0Decimals: number,
    token1Decimals: number,
  ) => void;
};

export type PoolPositionContextProps = {
  feeTier: string;
  rawFeeTier: number; // The unformatted fee tier value to be used in calculations
  selectedSymbol: string; // The symbol of the token that is currently in the ToggleSwitch. Controls which set of token liquidity and price data is displayed
  handleReverseTokenData: (symbol: string) => void;
  isCollectAsWrappedNative: boolean; // This boolean controls the toggle in the UI to collect fees as the native token
  handleCollectAsWrappedNative: (isCollectAsWrappedNative: boolean) => void;
  poolToken0: PoolToken | null;
  poolToken1: PoolToken | null;
  poolPosition: PoolPositionResponse | null;
  currentPrice: string;
  minPrice: string;
  maxPrice: string;
  isReversedPoolTokens: boolean; // This boolean is only used by the pool position details page and the pool context to reverse the token order based on the selected symbol
  isPositionClosed: boolean; // This boolean is use to know when the position is closed and to hide collect fees and remove liquidity buttons
  refreshPoolPosition: () => void;
  positionNftId: string;
};

export type PoolTxnStepsProps = {
  txnStatus: TXN_STATUS;
  poolTokens: PoolToken[];
  txnHash?: Hash;
  txnMsg: string;
  addLiquidityInputValues: string[] | null;
  selectedFeeTier?: string;
};

export enum POOL_TXN_TYPE {
  ADD_LIQUIDITY = "add-liquidity",
  COLLECT_FEE = "collect-fee",
  NEW_POSITION = "new-position",
  REMOVE_LIQUIDITY = "remove-liquidity",
}

export const getTxnType = (pathname: string): POOL_TXN_TYPE => {
  if (pathname.includes(POOL_TXN_TYPE.ADD_LIQUIDITY))
    return POOL_TXN_TYPE.ADD_LIQUIDITY;
  if (pathname.includes(POOL_TXN_TYPE.NEW_POSITION))
    return POOL_TXN_TYPE.NEW_POSITION;
  if (pathname.includes(POOL_TXN_TYPE.REMOVE_LIQUIDITY))
    return POOL_TXN_TYPE.REMOVE_LIQUIDITY;
  return POOL_TXN_TYPE.COLLECT_FEE;
};

export type TxnComponentProps = {
  poolTokens: PoolToken[];
  addLiquidityInputValues: string[] | null;
  selectedFeeTier?: string;
};

export type TxnLoaderProps = {
  poolTokens: PoolToken[];
  addLiquidityInputValues: string[] | null;
  poolTxnType: POOL_TXN_TYPE;
};

export type TxnSuccessProps = {
  poolTokens: PoolToken[];
  txnHash: Hash;
};
