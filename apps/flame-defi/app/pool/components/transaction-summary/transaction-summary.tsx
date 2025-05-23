"use client";

import { useMemo } from "react";

import { TransactionStatus } from "@repo/flame-types";
import { BlockLoader, Button, SuccessCheck } from "@repo/ui/components";
import { ErrorIcon } from "@repo/ui/icons";
import { useAstriaChainData } from "config";

import { AddLiquidityTransactionSummary } from "./add-liquidity-transaction-summary";
import { CollectFeesTransactionSummary } from "./collect-fees-transaction-summary";
import {
  type TransactionFailedProps,
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

const TransactionFailed = ({ error }: TransactionFailedProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="my-6">
        <ErrorIcon size={100} className="text-danger" />
      </div>
      <div className="mt-4">
        <span>{error || "An error occurred. Please try again."}</span>
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
    return <TransactionFailed error={error} />;
  }

  if (type === TransactionType.COLLECT_FEES) {
    return <CollectFeesTransactionSummary {...props} />;
  }
  if (type === TransactionType.ADD_LIQUIDITY) {
    return <AddLiquidityTransactionSummary {...props} />;
  }

  throw new Error(`Unknown transaction type: ${type}`);
};
