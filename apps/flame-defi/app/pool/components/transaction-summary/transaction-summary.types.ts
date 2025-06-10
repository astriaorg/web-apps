import type { EvmCurrency } from "@repo/flame-types";
import type {
  TransactionSuccessProps as BaseTransactionSuccessProps,
  TransactionSummaryProps as BaseTransactionSummaryProps,
} from "components/transaction-summary";
import type { Position } from "pool/types";

export enum TransactionType {
  ADD_LIQUIDITY = "ADD_LIQUIDITY",
  COLLECT_FEES = "COLLECT_FEES",
  CREATE_POSITION = "CREATE_POSITION",
  REMOVE_LIQUIDITY = "REMOVE_LIQUIDITY",
}

interface BasePoolTransactionSummaryProps extends BaseTransactionSummaryProps {
  token0: EvmCurrency;
  token1: EvmCurrency;
  type: TransactionType;
}

export interface CreatePositionSummaryProps
  extends BasePoolTransactionSummaryProps {
  type: TransactionType.CREATE_POSITION;
  amount0: string;
  amount1: string;
  minPrice: string;
  maxPrice: string;
}

export interface CollectFeesTransactionSummaryProps
  extends BasePoolTransactionSummaryProps {
  type: TransactionType.COLLECT_FEES;
  position: Position;
  unclaimedFees0: string;
  unclaimedFees1: string;
}

export interface AddLiquidityTransactionSummaryProps
  extends BasePoolTransactionSummaryProps {
  type: TransactionType.ADD_LIQUIDITY;
  position: Position;
  amount0: string;
  amount1: string;
  minPrice: string;
  maxPrice: string;
}

export interface RemoveLiquidityTransactionSummaryProps
  extends BasePoolTransactionSummaryProps {
  type: TransactionType.REMOVE_LIQUIDITY;
  position: Position;
  percentage: number;
  amount0: string;
  amount1: string;
}

export type TransactionSummaryProps =
  | CreatePositionSummaryProps
  | CollectFeesTransactionSummaryProps
  | AddLiquidityTransactionSummaryProps
  | RemoveLiquidityTransactionSummaryProps;

export interface TransactionSuccessProps extends BaseTransactionSuccessProps {
  token0: EvmCurrency;
  token1: EvmCurrency;
  type: TransactionType;
}
