"use client";

import { useCallback, useState } from "react";
import { useConfig } from "wagmi";

import { HexString } from "@repo/flame-types";
import { useCosmosWallet } from "features/cosmos-wallet";

import { createBridgeStrategy } from "bridge/strategies";
import {
  ChainConnection,
  DepositError,
  KeplrWalletError,
  WalletConnectionError,
  WithdrawError,
} from "bridge/types";

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

      if (!destinationConnection.chain) {
        throw new WithdrawError("Destination chain not selected.");
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
