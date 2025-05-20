"use client";

import { TransactionStatus } from "@repo/flame-types";
import { BlockLoader, SuccessCheck } from "@repo/ui/components";
import { ErrorIcon } from "@repo/ui/icons";
import { useAstriaChainData } from "config";
import { PoolTransactionType } from "pool/types";

import { CollectFeesTransactionSummary } from "./collect-fees-transaction-summary";
import {
  type TransactionFailedProps,
  type TransactionSuccessProps,
  type TransactionSummaryProps,
  TransactionType,
} from "./transaction-summary.types";

const TransactionLoader = ({ type }: TransactionSummaryProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full mt-20">
      <BlockLoader className="mb-20" />
      <div className="text-white font-medium mt-6 text-center">
        <span className="text-base md:text-lg mb-2">
          Confirm this transaction in your wallet.
        </span>
        <div className="flex items-center gap-1 justify-center text-sm md:text-base">
          {type === TransactionType.COLLECT_FEES && (
            <span>Collecting Fees</span>
          )}
        </div>
      </div>
    </div>
  );
};

const TransactionSuccess = ({
  token0,
  token1,
  hash,
}: TransactionSuccessProps) => {
  const { chain } = useAstriaChainData();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <SuccessCheck />
      <div className="text-white font-medium mt-6 mb-6 text-center w-full">
        <div className="flex flex-col md:flex-row items-center gap-1 justify-center text-sm md:text-base">
          <div className="flex items-center gap-1">
            <span>
              Successfully added {token0.coinDenom}/{token1.coinDenom}{" "}
              liquidity.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 justify-center text-base">
          <a
            href={`${chain.blockExplorerUrl}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-orange hover:text-orange/80 transition text-base md:text-lg underline"
          >
            View on Explorer
          </a>
        </div>
      </div>
    </div>
  );
};

const TransactionFailed = ({ error }: TransactionFailedProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <ErrorIcon size={170} className="text-orange" />
      <div className="text-white font-medium mt-6 text-center">
        <div className="flex items-center gap-1 justify-center text-base">
          <span>{error}</span>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TransactionDetails = {
  [PoolTransactionType.COLLECT_FEE]: CollectFeesTransactionSummary,
} as const;

// TODO: Clean up component.
export const TransactionSummary = ({
  position,
  token0,
  token1,
  unclaimedFees0,
  unclaimedFees1,
  type,
  hash,
  status,
  error,
  onSubmit,
}: TransactionSummaryProps) => {
  const TransactionComponent = CollectFeesTransactionSummary;

  return (
    <>
      {status === TransactionStatus.IDLE && (
        <TransactionComponent
          position={position}
          token0={token0}
          token1={token1}
          unclaimedFees0={unclaimedFees0}
          unclaimedFees1={unclaimedFees1}
          type={type}
          hash={hash}
          status={status}
          error={error}
          onSubmit={onSubmit}
        />
      )}
      {status === TransactionStatus.PENDING && (
        <TransactionLoader
          position={position}
          token0={token0}
          token1={token1}
          unclaimedFees0={unclaimedFees0}
          unclaimedFees1={unclaimedFees1}
          type={type}
          hash={hash}
          status={status}
          error={error}
          onSubmit={onSubmit}
        />
      )}
      {status === TransactionStatus.SUCCESS && hash && (
        <TransactionSuccess token0={token0} token1={token1} hash={hash} />
      )}
      {status === TransactionStatus.FAILED && (
        <TransactionFailed error={error} />
      )}
    </>
  );
};
