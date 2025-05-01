"use client";

import { WalletConnectionError, WithdrawError } from "bridge/errors";
import { useBridgeStrategy } from "bridge/hooks/use-bridge-strategy";
import { ChainConnection } from "bridge/types";
import { useCallback, useState } from "react";
import { type Address } from "viem";

export interface WithdrawTransactionHook {
  isLoading: boolean;
  executeWithdraw: (params: {
    amount: string;
    sourceConnection: ChainConnection;
    destinationConnection: ChainConnection;
    recipientAddressOverride?: string;
  }) => Promise<void>;
}

export function useWithdrawTransaction(): WithdrawTransactionHook {
  const { executeStrategy } = useBridgeStrategy();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const executeWithdraw = useCallback(
    async ({
      amount,
      sourceConnection,
      destinationConnection,
      recipientAddressOverride,
    }: {
      amount: string;
      sourceConnection: ChainConnection;
      destinationConnection: ChainConnection;
      recipientAddressOverride?: string;
    }): Promise<void> => {
      // Use either manual recipient address or the destination chain address
      const recipientAddress = (recipientAddressOverride ||
        destinationConnection.address) as Address;

      // Basic validation
      if (!sourceConnection.address || !recipientAddress) {
        throw new WalletConnectionError();
      }

      if (!destinationConnection.chain) {
        throw new WithdrawError("Destination chain not selected.");
      }

      setIsLoading(true);

      try {
        await executeStrategy({
          amount,
          sourceConnection,
          recipientAddress,
          destinationChainType: destinationConnection.chain.chainType,
        });
      } catch (e) {
        console.error("Withdraw failed", e);
        throw new WithdrawError(
          e instanceof Error ? e.message : "Unknown error.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [executeStrategy],
  );

  return {
    isLoading,
    executeWithdraw,
  };
}
