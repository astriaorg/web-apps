"use client";

import { useMemo } from "react";

import { TransactionStatus } from "@repo/flame-types";
import {
  TransactionFailed,
  TransactionLoader,
  TransactionSuccess as BaseTransactionSuccess,
} from "components/transaction-summary";
import { SwapTransactionSummary } from "swap/components/transaction-summary/swap-transaction-summary";

import {
  type TransactionSuccessProps,
  type TransactionSummaryProps,
  TransactionType,
} from "./transaction-summary.types";

const TransactionSuccess = ({
  token0,
  token1,
  type,
  hash,
}: TransactionSuccessProps) => {
  const message = useMemo(() => {
    if (type === TransactionType.SWAP) {
      return "Transaction successful!";
    }
    throw new Error(`Unknown transaction type: ${type}`);
  }, [type]);

  return (
    <BaseTransactionSuccess hash={hash}>
      <span>{message}</span>
    </BaseTransactionSuccess>
  );
};

export const TransactionSummary = (props: TransactionSummaryProps) => {
  const { token0, token1, type, hash, status, error } = props;

  if (status === TransactionStatus.PENDING) {
    return <TransactionLoader />;
  }

  if (status === TransactionStatus.SUCCESS && hash) {
    return (
      <TransactionSuccess
        token0={token0}
        token1={token1}
        type={type}
        hash={hash}
      />
    );
  }

  if (status === TransactionStatus.FAILED) {
    return <TransactionFailed message={error?.message} />;
  }

  if (type === TransactionType.SWAP) {
    return <SwapTransactionSummary {...props} />;
  }

  throw new Error(`Unknown transaction type: ${type}`);
};
