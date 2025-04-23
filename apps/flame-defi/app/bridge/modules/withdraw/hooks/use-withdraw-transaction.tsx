"use client";

import { useCallback, useState } from "react";
import { type Address } from "viem";
import { useConfig } from "wagmi";

import { useCosmosWallet } from "features/cosmos-wallet";

import { WalletConnectionError, WithdrawError } from "bridge/errors";
import { createBridgeStrategy } from "bridge/strategies";
import { ChainConnection } from "bridge/types";

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
  const wagmiConfig = useConfig();
  const cosmosWallet = useCosmosWallet();

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
        const withdrawStrategy = createBridgeStrategy(
          {
            amount,
            sourceConnection,
            cosmosWallet,
            wagmiConfig,
          },
          destinationConnection.chain.chainType,
        );

        await withdrawStrategy.execute(recipientAddress);
      } catch (e) {
        console.error("Withdraw failed", e);
        throw new WithdrawError(
          e instanceof Error ? e.message : "Unknown error.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [cosmosWallet, wagmiConfig],
  );

  return {
    isLoading,
    executeWithdraw,
  };
}
