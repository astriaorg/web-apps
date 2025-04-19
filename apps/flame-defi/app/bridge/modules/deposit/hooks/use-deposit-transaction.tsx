"use client";

import { useState, useCallback } from "react";
import { useConfig } from "wagmi";

import { HexString } from "@repo/flame-types";
import { useCosmosWallet } from "features/cosmos-wallet";

import { createDepositStrategy } from "bridge/modules/deposit/strategies/deposit-strategies";
import { ChainConnection } from "bridge/types";

export class DepositError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DepositError";
  }
}

export class WalletConnectionError extends DepositError {
  constructor(message = "Please connect your wallets first.") {
    super(message);
    this.name = "WalletConnectionError";
  }
}

export class KeplrWalletError extends DepositError {
  constructor(
    message = "Failed to get account from Keplr wallet. Does this address have funds for the selected chain?",
  ) {
    super(message);
    this.name = "KeplrWalletError";
  }
}

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
  const wagmiConfig = useConfig();
  const cosmosWallet = useCosmosWallet();

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
        destinationConnection.address) as HexString;

      // Basic validation
      if (!sourceConnection.address || !recipientAddress) {
        throw new WalletConnectionError();
      }

      setIsLoading(true);

      try {
        const depositStrategy = createDepositStrategy({
          amount,
          sourceConnection,
          cosmosWallet,
          wagmiConfig,
        });

        await depositStrategy.execute(recipientAddress);
        return;
      } catch (e) {
        console.error("Deposit failed", e);
        const message = e instanceof Error ? e.message : "Unknown error.";

        // Convert specific errors to our custom error types
        if (/failed to get account from keplr wallet/i.test(message)) {
          throw new KeplrWalletError();
        } else {
          throw new DepositError(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [cosmosWallet, wagmiConfig],
  );

  return {
    isLoading,
    executeDeposit,
  };
}
