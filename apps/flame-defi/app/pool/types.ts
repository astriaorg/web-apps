import {
  EvmCurrency,
  HexString,
  TXN_STATUS,
  TokenInputState,
} from "@repo/flame-types";
import { Address } from "viem";
import { FeeTier } from "./constants/pool-constants";

export enum POOL_INPUT_ID {
  INPUT_ONE = "input_one",
  INPUT_TWO = "input_two",
}
export interface AddLiquidityInputsBlockProps {
  inputOne: string;
  inputTwo: string;
  handleInputChange: (
    value: string,
    id: POOL_INPUT_ID,
    coinDecimals?: number,
  ) => void;
  tokenOne: EvmCurrency | null;
  tokenTwo: EvmCurrency | null;
  tokenOneBalance: {
    value: string;
    symbol: string;
  } | null;
  tokenTwoBalance: {
    value: string;
    symbol: string;
  } | null;
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

export interface TokenBalance {
  value: string;
  symbol: string;
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
  rawFeeTier: number;
  symbols: string[];
  selectedSymbol: string;
  handleReverseTokenData: (symbol: string) => void;
  collectAsNative: boolean;
  handleCollectAsNative: (collectAsNative: boolean) => void;
  poolToken0: PoolToken | null;
  poolToken1: PoolToken | null;
  poolPosition: PoolPositionResponse | null;
  currentPrice: string;
  minPrice: string;
  maxPrice: string;
  reversedPoolTokens: boolean;
  positionClosed: boolean;
  refreshPoolPosition: () => void;
};

export type PoolTxnStepsProps = {
  txnStatus: TXN_STATUS;
  poolTokens: PoolToken[];
  txnHash: HexString | undefined;
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
  txnHash: HexString | undefined;
};
