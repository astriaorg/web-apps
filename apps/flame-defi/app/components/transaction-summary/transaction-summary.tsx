"use client";

import { type PropsWithChildren, useMemo } from "react";

import { type TransactionFailedProps } from "@repo/flame-types";
import { BlockLoader, Button, SuccessCheck } from "@repo/ui/components";
import { WarningTriangleIcon } from "@repo/ui/icons";
import { useAstriaChainData } from "config";

import { type TransactionSuccessProps } from "./transaction-summary.types";

export const TransactionLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <BlockLoader className="my-24" />
      <div className="mt-6">
        <span>Confirm this transaction in your wallet.</span>
      </div>
    </div>
  );
};

export const TransactionSuccess = ({
  hash,
  children,
}: TransactionSuccessProps & PropsWithChildren) => {
  const { chain } = useAstriaChainData();

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="my-6">
        <SuccessCheck />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">{children}</div>
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

export const TransactionFailed = ({ message }: TransactionFailedProps) => {
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
