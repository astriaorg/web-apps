"use client";

import { useState, useCallback } from "react";
import { useConfig } from "wagmi";

import { HexString } from "@repo/flame-types";
import { useCosmosWallet } from "features/cosmos-wallet";

import { createWithdrawStrategy } from "bridge/modules/withdraw/strategies/withdraw-strategies";
import { ChainConnection } from "bridge/types";

export class WithdrawError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WithdrawError";
  }
}

export class WalletConnectionError extends WithdrawError {
  constructor(message = "Please connect your wallets first.") {
    super(message);
    this.name = "WalletConnectionError";
  }
}

export class AstriaWalletError extends WithdrawError {
  constructor(
    message = "Failed to connect to Astria wallet. Please try again.",
  ) {
    super(message);
    this.name = "AstriaWalletError";
  }
}

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
        destinationConnection.address) as HexString;

      // Basic validation
      if (!sourceConnection.address || !recipientAddress) {
        throw new WalletConnectionError();
      }

      setIsLoading(true);

      try {
        if (!destinationConnection.chain) {
          throw new WithdrawError("Destination chain not selected");
        }

        const withdrawStrategy = createWithdrawStrategy(
          {
            amount,
            sourceConnection,
            cosmosWallet,
            wagmiConfig,
          },
          destinationConnection.chain.chainType,
        );

        await withdrawStrategy.execute(recipientAddress);
        return;
      } catch (e) {
        console.error("Withdraw failed", e);
        const message = e instanceof Error ? e.message : "Unknown error.";

        // Convert specific errors to our custom error types
        if (/failed to connect to astria wallet/i.test(message)) {
          throw new AstriaWalletError();
        } else {
          throw new WithdrawError(message);
        }
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
