"use client";

import { useCallback } from "react";
import { Address } from "viem";
import { useConfig as useWagmiConfig } from "wagmi";

import { ChainType } from "@repo/flame-types";
import { createBridgeStrategy } from "bridge/strategies";
import { ChainConnection } from "bridge/types";
import { useCosmosWallet } from "features/cosmos-wallet";

export interface UseBridgeStrategyResult {
  executeStrategy: (params: {
    amount: string;
    sourceConnection: ChainConnection;
    recipientAddress: Address;
    destinationChainType: ChainType;
  }) => Promise<void>;
}

/**
 * Hook to encapsulate the creation and execution of bridge strategies.
 * This centralizes the configuration needed for bridge strategies and token approvals.
 */
export function useBridgeStrategy(): UseBridgeStrategyResult {
  const wagmiConfig = useWagmiConfig();
  const cosmosWallet = useCosmosWallet();

  /**
   * Executes a bridge strategy with token approval handling if needed
   */
  const executeStrategy = useCallback(
    async (params: {
      amount: string;
      sourceConnection: ChainConnection;
      recipientAddress: Address;
      destinationChainType: ChainType;
    }): Promise<void> => {
      const {
        amount,
        sourceConnection,
        recipientAddress,
        destinationChainType,
      } = params;

      const strategy = createBridgeStrategy(
        {
          amount,
          sourceConnection,
          cosmosWallet,
          wagmiConfig,
        },
        destinationChainType,
      );
      await strategy.execute(recipientAddress);
    },
    [cosmosWallet, wagmiConfig],
  );

  return {
    executeStrategy,
  };
}
