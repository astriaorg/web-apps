import { EvmCurrency, TXN_STATUS, TokenInputState } from "@repo/flame-types";

export interface AddLiquidityInputsBlockProps {
  inputOne: string;
  inputTwo: string;
  setInputOne: (value: string) => void;
  setInputTwo: (value: string) => void;
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

export interface PoolPositionsRecord {
  position: {
    id: number;
    symbol: string;
    symbolTwo: string;
    percent: number;
    apr: number;
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
  poolPositionsRecord: PoolPositionsRecord[];
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
  txnStatus: TXN_STATUS;
  setTxnStatus: (txnStatus: TXN_STATUS) => void;
};

export type PoolPositionContextProps = {
  position?: Position;
  poolTokens: PoolToken[];
  feeTier: string;
  symbols: string[];
  selectedSymbol: string;
  handleReverseTokenData: (symbol: string) => void;
  collectAsNative: boolean;
  handleCollectAsNative: (collectAsNative: boolean) => void;
  poolTokenOne: PoolToken;
  poolTokenTwo: PoolToken;
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
