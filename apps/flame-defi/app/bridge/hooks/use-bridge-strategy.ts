"use client";

import { createBridgeStrategy } from "bridge/strategies";
import { ChainConnection } from "bridge/types";
import { useConfig } from "config";
import { useCallback } from "react";
import { Address } from "viem";
import { useConfig as useWagmiConfig } from "wagmi";

import { ChainType, EvmChainInfo, EvmCurrency } from "@repo/flame-types";
import { useCosmosWallet } from "features/cosmos-wallet";
import { createErc20Service } from "features/evm-wallet";

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
  const { tokenApprovalAmount } = useConfig();

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
      const { chain, currency } = sourceConnection;

      // Handle token approval for EVM chains if needed
      if (
        (chain?.chainType === ChainType.EVM ||
          chain?.chainType === ChainType.ASTRIA) &&
        currency instanceof EvmCurrency &&
        currency.erc20ContractAddress &&
        currency.astriaIntentBridgeAddress
      ) {
        const erc20Service = createErc20Service(
          wagmiConfig,
          currency.erc20ContractAddress,
        );
        await erc20Service.approveToken(
          (chain as EvmChainInfo).chainId,
          currency.astriaIntentBridgeAddress,
          tokenApprovalAmount,
          // tokenApprovalAmount already has decimals taken into account,
          //  so pass in 0 here
          0,
        );
      }

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
    [cosmosWallet, tokenApprovalAmount, wagmiConfig],
  );

  return {
    executeStrategy,
  };
}
