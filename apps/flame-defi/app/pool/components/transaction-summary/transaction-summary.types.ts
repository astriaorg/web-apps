import type { Hash } from "viem";

import type { EvmCurrency, TransactionStatus } from "@repo/flame-types";
import type { Position } from "pool/types";

export enum TransactionType {
  ADD_LIQUIDITY = "ADD_LIQUIDITY",
  COLLECT_FEES = "COLLECT_FEES",
  CREATE_POSITION = "CREATE_POSITION",
  REMOVE_LIQUIDITY = "REMOVE_LIQUIDITY",
}

interface BaseTransactionSummaryProps {
  position: Position;
  token0: EvmCurrency;
  token1: EvmCurrency;
  type: TransactionType;
  status: TransactionStatus;
  hash?: Hash;
  error?: Error;
  onSubmit: () => void;
}

export interface CollectFeesTransactionSummaryProps
  extends BaseTransactionSummaryProps {
  type: TransactionType.COLLECT_FEES;
  unclaimedFees0: string;
  unclaimedFees1: string;
}

export interface AddLiquidityTransactionSummaryProps
  extends BaseTransactionSummaryProps {
  type: TransactionType.ADD_LIQUIDITY;
  amount0: string;
  amount1: string;
  minPrice: string;
  maxPrice: string;
}

export interface RemoveLiquidityTransactionSummaryProps
  extends BaseTransactionSummaryProps {
  type: TransactionType.REMOVE_LIQUIDITY;
  percentage: number;
  amount0: string;
  amount1: string;
}

export type TransactionSummaryProps =
  | CollectFeesTransactionSummaryProps
  | AddLiquidityTransactionSummaryProps
  | RemoveLiquidityTransactionSummaryProps;

export type TransactionSuccessProps = {
  token0: EvmCurrency;
  token1: EvmCurrency;
  type: TransactionType;
  hash: Hash;
};
