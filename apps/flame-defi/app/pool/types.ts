import { EvmCurrency, TXN_STATUS } from "@repo/flame-types";

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

export interface TokenPriceData {
  symbol: string;
  unclaimedFees: number;
  liquidity: number;
  liquidityPercentage: number;
}

export type Position = {
  tokenData: TokenPriceData[];
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
  tokenData: TokenPriceData[];
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
};

export type PoolTxnStepsProps = {
  txnStatus: TXN_STATUS;
  poolPositionData: TokenPriceData[];
  txnHash: string;
  txnMsg: string;
};
