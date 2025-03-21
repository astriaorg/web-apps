import { EvmCurrency, TXN_STATUS } from "@repo/flame-types";

export interface AddLiquidityInputsBlockProps {
  inputOne: string;
  inputTwo: string;
  setInputOne: (value: string) => void;
  setInputTwo: (value: string) => void;
}

export interface StepProps {
  step: number;
  setStep: (thing: number) => void;
  tokenPair: TokenPair;
  selectedFeeTier: FeeData | undefined;
}

export interface TokenPair {
  tokenOne: EvmCurrency | null;
  tokenTwo: EvmCurrency | null;
}

export interface FeeData {
  id: number;
  feePercent: string;
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

export interface PoolPositionsTableData {
  position: {
    id: number;
    symbol: string;
    symbolTwo: string;
    percent: number;
  };
  positionStatus: string;
  inRange: boolean;
}

export interface PoolToken {
  symbol: string;
  unclaimedFees: number;
  liquidity: number;
  liquidityPercentage: number;
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

export type PoolContextProps = {
  feeData: FeeData[];
  poolPositionsTableData: PoolPositionsTableData[];
};

export type PoolDetailsContextProps = {
  positionDetails: Position | undefined;
  poolTokens: PoolToken[];
  feeTier: string;
  symbols: string[];
  selectedSymbol: string;
  handleReverseTokenData: (symbol: string) => void;
  collectAsNative: boolean;
  handleCollectAsNative: (collectAsNative: boolean) => void;
  txnStatus: TXN_STATUS;
  setTxnStatus: (txnStatus: TXN_STATUS) => void;
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
  poolTokenOne: PoolToken;
  poolTokenTwo: PoolToken;
};

export type PoolTxnStepsProps = {
  txnStatus: TXN_STATUS;
  poolTokens: PoolToken[];
  txnHash: string;
  txnMsg: string;
  addLiquidityInputValues: string[] | null;
};

export enum POOL_TXN_TYPE {
  ADD_LIQUIDITY = "add-liquidity",
  REMOVE_LIQUIDITY = "remove-liquidity",
  COLLECT_FEE = "collect-fee",
}

export const getTxnType = (pathname: string): POOL_TXN_TYPE => {
  if (pathname.includes(POOL_TXN_TYPE.ADD_LIQUIDITY))
    return POOL_TXN_TYPE.ADD_LIQUIDITY;
  if (pathname.includes(POOL_TXN_TYPE.REMOVE_LIQUIDITY))
    return POOL_TXN_TYPE.REMOVE_LIQUIDITY;
  return POOL_TXN_TYPE.COLLECT_FEE;
};

export type TxnComponentProps = {
  poolTokens: PoolToken[];
  addLiquidityInputValues: string[] | null;
};

export type TxnLoaderProps = {
  poolTokens: PoolToken[];
  addLiquidityInputValues: string[] | null;
  poolTxnType: POOL_TXN_TYPE;
};

export type TxnSuccessProps = {
  poolTokens: PoolToken[];
  txnHash: string;
}

