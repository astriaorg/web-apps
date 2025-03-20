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

export interface PoolTokenData {
  symbol: string;
  unclaimedFees: number;
  liquidity: number;
  liquidityPercentage: number;
}

export type Position = {
  tokenData: PoolTokenData[];
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
  poolTokenData: PoolTokenData[];
  feeTier: string;
  symbols: string[];
  selectedSymbol: string;
  handleReverseTokenData: (symbol: string) => void;
  collectAsWTIA: boolean;
  handleCollectAsWTIA: (collectAsWTIA: boolean) => void;
  txnStatus: TXN_STATUS;
  setTxnStatus: (txnStatus: TXN_STATUS) => void;
  modalOpen: boolean;
  setModalOpen: (modalOpen: boolean) => void;
  poolTokenOne: PoolTokenData;
  poolTokenTwo: PoolTokenData;
};

export type PoolTxnStepsProps = {
  txnStatus: TXN_STATUS;
  poolPositionData: PoolTokenData[];
  txnHash: string;
  txnMsg: string;
  addLiquidityInputValues?: string[];
};

export enum TxnType {
  ADD_LIQUIDITY = "add-liquidity",
  REMOVE_LIQUIDITY = "remove-liquidity",
  COLLECT_FEE = "collect-fee",
}

export const getTxnType = (pathname: string): TxnType => {
  if (pathname.includes(TxnType.ADD_LIQUIDITY)) return TxnType.ADD_LIQUIDITY;
  if (pathname.includes(TxnType.REMOVE_LIQUIDITY))
    return TxnType.REMOVE_LIQUIDITY;
  return TxnType.COLLECT_FEE;
};

export type TxnComponentProps = Pick<
  PoolTxnStepsProps,
  "poolPositionData" | "addLiquidityInputValues"
>;
export type TxnLoaderProps = Pick<
  PoolTxnStepsProps,
  "poolPositionData" | "addLiquidityInputValues"
> & { txnType: TxnType };
export type TxnSuccessProps = Pick<
  PoolTxnStepsProps,
  "txnHash" | "poolPositionData"
>;
export type TxnFailedProps = Pick<PoolTxnStepsProps, "txnMsg">;
