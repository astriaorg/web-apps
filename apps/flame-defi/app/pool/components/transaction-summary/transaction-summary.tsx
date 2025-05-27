"use client";

import { useMemo } from "react";

import {
  type TransactionFailedProps,
  TransactionStatus,
} from "@repo/flame-types";
import { BlockLoader, Button, SuccessCheck } from "@repo/ui/components";
import { WarningTriangleIcon } from "@repo/ui/icons";
import { useAstriaChainData } from "config";

import { AddLiquidityTransactionSummary } from "./add-liquidity-transaction-summary";
import { CollectFeesTransactionSummary } from "./collect-fees-transaction-summary";
import { RemoveLiquidityTransactionSummary } from "./remove-liquidity-transaction-summary";
import {
  type TransactionSuccessProps,
  type TransactionSummaryProps,
  TransactionType,
} from "./transaction-summary.types";

const TransactionLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <BlockLoader className="my-24" />
      <div className="mt-6">
        <span>Confirm this transaction in your wallet.</span>
      </div>
    </div>
  );
};

const TransactionSuccess = ({
  token0,
  token1,
  type,
  hash,
}: TransactionSuccessProps) => {
  const { chain } = useAstriaChainData();

  const message = useMemo(() => {
    if (type === TransactionType.COLLECT_FEES) {
      return `Successfully collected fees for ${token0.coinDenom}/${token1.coinDenom}.`;
    }
    if (type === TransactionType.ADD_LIQUIDITY) {
      return `Successfully added liquidity for ${token0.coinDenom}/${token1.coinDenom}.`;
    }
    throw new Error(`Unknown transaction type: ${type}`);
  }, [type, token0, token1]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="my-6">
        <SuccessCheck />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span>{message}</span>
        </div>
      </div>
      <Button asChild className="w-full mt-6">
        <a
          href={`${chain.blockExplorerUrl}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Explorer
        </a>
      </Button>
    </div>
  );
};

const TransactionFailed = ({ message }: TransactionFailedProps) => {
  const text = useMemo(() => {
    if (message) {
      if (message.includes("User rejected the request.")) {
        return "Transaction rejected.";
      }
      return "An error occurred. Please try again.";
    }
  }, [message]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="my-6">
        <WarningTriangleIcon size={100} className="text-danger" />
      </div>
      <div className="mt-4">
        <span>{text}</span>
      </div>
    </div>
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

  throw new Error(`Unknown transaction type: ${type}`);
};
