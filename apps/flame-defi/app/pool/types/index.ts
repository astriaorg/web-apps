import { TXN_STATUS } from "@repo/flame-types";

export interface PoolToken {
  symbol: string;
  unclaimedFees: number;
  liquidity: number;
  liquidityPercentage: number;
}

export interface Position {
  tokens: PoolToken[];
  feeTier: number;
  inRange: boolean;
  min: number;
  max: string;
  positionStatus: string;
}

export interface PoolPositionContextProps {
  position: Position;
  poolTokens: PoolToken[];
  feeTier: string;
  symbols: string[];
  selectedSymbol: string;
  handleReverseTokenData: (symbol: string) => void;
  collectAsNative: boolean;
  handleCollectAsNative: (collectAsNative: boolean) => void;
  txnStatus: TXN_STATUS;
  setTxnStatus: (status: TXN_STATUS) => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  poolTokenOne: PoolToken;
  poolTokenTwo: PoolToken;
  currentPrice: number;
  minPrice: number;
  maxPrice: string;
}
