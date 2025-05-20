import type { Hash } from "viem";

import type { EvmCurrency, TransactionStatus } from "@repo/flame-types";
import type { Position } from "pool/types";

export enum TransactionType {
  ADD_LIQUIDITY = "ADD_LIQUIDITY",
  COLLECT_FEES = "COLLECT_FEES",
  CREATE_POSITION = "CREATE_POSITION",
  REMOVE_LIQUIDITY = "REMOVE_LIQUIDITY",
}

export interface TransactionSummaryProps {
  position: Position;
  token0: EvmCurrency;
  token1: EvmCurrency;
  unclaimedFees0: string;
  unclaimedFees1: string;
  type: TransactionType;
  hash: Hash | null;
  status: TransactionStatus;
  error: string | null;
  onSubmit: () => void;
}

export type TransactionSuccessProps = {
  token0: EvmCurrency;
  token1: EvmCurrency;
  type: TransactionType;
  hash: Hash;
};

export type TransactionFailedProps = {
  error: string | null;
};
