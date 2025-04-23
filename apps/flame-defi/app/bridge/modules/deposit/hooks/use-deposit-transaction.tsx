"use client";

import { useCallback, useState } from "react";
import { Address } from "viem";
import { useConfig } from "wagmi";

import { KeplrWalletError, useCosmosWallet } from "features/cosmos-wallet";

import { DepositError, WalletConnectionError } from "bridge/errors";
import { createBridgeStrategy } from "bridge/strategies";
import { ChainConnection } from "bridge/types";

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
        const depositStrategy = createBridgeStrategy(
          {
            amount,
            sourceConnection,
            cosmosWallet,
            wagmiConfig,
          },
          destinationConnection.chain.chainType,
        );

        await depositStrategy.execute(recipientAddress);
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
    [cosmosWallet, wagmiConfig],
  );

  return {
    isLoading,
    executeDeposit,
  };
}
