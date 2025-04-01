import { EvmCurrency, TXN_STATUS, TokenInputState } from "@repo/flame-types";
import { Address } from "viem";
import { FeeTier } from "./constants/pool-constants";

export interface AddLiquidityInputsBlockProps {
  inputOne: string;
  inputTwo: string;
  setInputOne: (value: string) => void;
  setInputTwo: (value: string) => void;
  poolTokenOne: PoolToken;
  poolTokenTwo: PoolToken;
}
export interface NewPositionInputsProps {
  inputOne: TokenInputState;
  inputTwo: TokenInputState;
  setInputOne: (value: TokenInputState) => void;
  setInputTwo: (value: TokenInputState) => void;
  currencies: EvmCurrency[];
}

export interface TokenPair {
  tokenOne: EvmCurrency | null;
  tokenTwo: EvmCurrency | null;
}

export interface FeeData {
  id: number;
  feeTier: FeeTier;
  text: string;
  tvl: string;
  selectPercent: string;
}

export interface PriceCardProps {
  leftLabel: string;
  value: string | number;
  rightLabel?: string;
  tooltipText?: string;
  className?: string;
}

export interface PoolPositionsRecord {
  symbolOne: string;
  symbolTwo: string;
  feePercent: FeeTier;
  positionStatus: string;
  inRange: boolean;
}

export interface PoolToken {
  symbol: string;
  unclaimedFees: number;
  liquidity: number;
  liquidityPercentage: number;
  isNative: boolean;
  isWrappedNative: boolean;
}

export type Position = {
  tokens: PoolToken[];
  feeTier: number;
  inRange: boolean;
  positionStatus: string;
  min: number;
  max: number | "∞";
};

export type Positions = {
  [key: number]: Position;
};

export type PoolPositionResponse = {
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
  tokenId?: string;
};

export interface PoolPosition extends PoolPositionResponse {
  feePercent: FeeTier;
  symbolOne: string;
  symbolTwo: string;
  inRange: boolean;
  positionStatus: string;
  poolAddress: Address | null;
  tokenOne: EvmCurrency | null;
  tokenTwo: EvmCurrency | null;
}

export type PoolContextProps = {
  feeData: FeeData[];
  poolPositions: PoolPosition[];
  poolPositionsLoading: boolean;
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
  txnStatus: TXN_STATUS;
  setTxnStatus: (txnStatus: TXN_STATUS) => void;
};

export type PoolPositionContextProps = {
  feeTier: string;
  symbols: string[];
  selectedSymbol: string;
  handleReverseTokenData: (symbol: string) => void;
  collectAsNative: boolean;
  handleCollectAsNative: (collectAsNative: boolean) => void;
  poolTokenOne: PoolToken | null;
  poolTokenTwo: PoolToken | null;
  currentPrice: string;
  minPrice: string;
  maxPrice: string;
};

export type PoolTxnStepsProps = {
  txnStatus: TXN_STATUS;
  poolTokens: PoolToken[];
  txnHash: string;
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
  txnHash: string;
};
