"use client";

import { useMemo } from "react";

import { TransactionStatus } from "@repo/flame-types";
import {
  TransactionFailed,
  TransactionLoader,
  TransactionSuccess as BaseTransactionSuccess,
} from "components/transaction-summary";

import { AddLiquidityTransactionSummary } from "./add-liquidity-transaction-summary";
import { CollectFeesTransactionSummary } from "./collect-fees-transaction-summary";
import { CreatePositionTransactionSummary } from "./create-position-transaction-summary";
import { RemoveLiquidityTransactionSummary } from "./remove-liquidity-transaction-summary";
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
    if (type === TransactionType.CREATE_POSITION) {
      return `Successfully created position for ${token0.coinDenom}/${token1.coinDenom}.`;
    }
    if (type === TransactionType.COLLECT_FEES) {
      return `Successfully collected fees for ${token0.coinDenom}/${token1.coinDenom}.`;
    }
    if (type === TransactionType.ADD_LIQUIDITY) {
      return `Successfully added liquidity for ${token0.coinDenom}/${token1.coinDenom}.`;
    }
    if (type === TransactionType.REMOVE_LIQUIDITY) {
      return `Successfully removed liquidity for ${token0.coinDenom}/${token1.coinDenom}.`;
    }
    throw new Error(`Unknown transaction type: ${type}`);
  }, [type, token0, token1]);

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

  if (type === TransactionType.COLLECT_FEES) {
    return <CollectFeesTransactionSummary {...props} />;
  }
  if (type === TransactionType.ADD_LIQUIDITY) {
    return <AddLiquidityTransactionSummary {...props} />;
  }
  if (type === TransactionType.REMOVE_LIQUIDITY) {
    return <RemoveLiquidityTransactionSummary {...props} />;
  }
  if (type === TransactionType.CREATE_POSITION) {
    return <CreatePositionTransactionSummary {...props} />;
  }

  throw new Error(`Unknown transaction type: ${type}`);
};
