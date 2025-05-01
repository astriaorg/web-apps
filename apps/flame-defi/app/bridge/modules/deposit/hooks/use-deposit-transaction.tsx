"use client";

import { DepositError, WalletConnectionError } from "bridge/errors";
import { useBridgeStrategy } from "bridge/hooks/use-bridge-strategy";
import { ChainConnection } from "bridge/types";
import { useCallback, useState } from "react";
import { Address } from "viem";

import { KeplrWalletError } from "features/cosmos-wallet";

export interface DepositTransactionHook {
  isLoading: boolean;
  executeDeposit: (params: {
    amount: string;
    sourceConnection: ChainConnection;
    destinationConnection: ChainConnection;
    recipientAddressOverride?: string;
  }) => Promise<void>;
}

export function useDepositTransaction(): DepositTransactionHook {
  const { executeStrategy } = useBridgeStrategy();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const executeDeposit = useCallback(
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
        throw new DepositError("Destination chain not selected.");
      }

      setIsLoading(true);

      try {
        await executeStrategy({
          amount,
          sourceConnection,
          recipientAddress,
          destinationChainType: destinationConnection.chain.chainType,
        });
        return;
      } catch (e) {
        console.error("Deposit failed", e);
        const message = e instanceof Error ? e.message : "Unknown error.";
        // Convert specific errors to our custom error types.
        // This comes from keplr wallet
        if (/failed to get account from keplr wallet/i.test(message)) {
          throw new KeplrWalletError();
        } else {
          throw new DepositError(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [executeStrategy],
  );

  return {
    isLoading,
    executeDeposit,
  };
}
