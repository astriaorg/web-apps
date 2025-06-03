import type { EvmCurrency } from "@repo/flame-types";
import type {
  TransactionSuccessProps as BaseTransactionSuccessProps,
  TransactionSummaryProps as BaseTransactionSummaryProps,
} from "components/transaction-summary";

export enum TransactionType {
  SWAP = "SWAP",
}

interface BaseSwapTransactionSummaryProps extends BaseTransactionSummaryProps {
  token0: EvmCurrency;
  token1: EvmCurrency;
  type: TransactionType;
}

export interface SwapSummaryProps extends BaseSwapTransactionSummaryProps {
  type: TransactionType.SWAP;
  action: string;
  fee: string;
  amount0: string;
  amount1: string;
  amountOut: string;
  amountMin: string;
  priceImpact: string;
  frontendFeeEstimate?: string;
}

export type TransactionSummaryProps = SwapSummaryProps;

export interface TransactionSuccessProps extends BaseTransactionSuccessProps {
  token0: EvmCurrency;
  token1: EvmCurrency;
  type: TransactionType;
}
