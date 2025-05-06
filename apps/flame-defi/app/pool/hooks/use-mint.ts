import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAstriaChainData } from "config";
import { useCallback } from "react";
import { type Address, parseUnits } from "viem";
import { useAccount, useConfig, usePublicClient } from "wagmi";

import { type EvmCurrency } from "@repo/flame-types";
import { createNonfungiblePositionManagerService } from "features/evm-wallet";

export interface MintParams {
  token0: EvmCurrency;
  token1: EvmCurrency;
  fee: number;
  tickLower: number;
  tickUpper: number;
  amount0Desired: string;
  amount1Desired: string;
  amount0Min: string;
  amount1Min: string;
  recipient: Address;
  deadline: bigint;
  /**
   * Optional - only needed when pool doesn't exist.
   */
  sqrtPriceX96?: bigint;
}

export const useMint = () => {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const config = useConfig();
  const { address, chainId } = useAccount();
  const { chain } = useAstriaChainData();

  const mutation = useMutation({
    mutationFn: async (params: MintParams) => {
      if (!address || !chainId || !publicClient) {
        throw new Error("Wallet is not connected.");
      }

      const nonfungiblePositionManagerService =
        createNonfungiblePositionManagerService(
          config,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const token0Address = params.token0.isNative
        ? chain.contracts.wrappedNativeToken.address
        : (params.token0.erc20ContractAddress as Address);

      const token1Address = params.token1.isNative
        ? chain.contracts.wrappedNativeToken.address
        : (params.token1.erc20ContractAddress as Address);

      // Sort token addresses if needed. Uniswap requires token0 < token1.
      let sortedToken0 = params.token0;
      let sortedToken1 = params.token1;
      let sortedToken0Address = token0Address;
      let sortedToken1Address = token1Address;
      let sortedAmount0Desired = params.amount0Desired;
      let sortedAmount1Desired = params.amount1Desired;
      let sortedAmount0Min = params.amount0Min;
      let sortedAmount1Min = params.amount1Min;

      if (token0Address.toLowerCase() > token1Address.toLowerCase()) {
        sortedToken0 = params.token1;
        sortedToken1 = params.token0;
        sortedToken0Address = token1Address;
        sortedToken1Address = token0Address;
        sortedAmount0Desired = params.amount1Desired;
        sortedAmount1Desired = params.amount0Desired;
        sortedAmount0Min = params.amount1Min;
        sortedAmount1Min = params.amount0Min;
      }

      let value: bigint = BigInt(0);
      if (params.token0.isNative) {
        value = BigInt(params.amount0Desired);
      }
      if (params.token1.isNative) {
        value = BigInt(params.amount1Desired);
      }

      const result =
        await nonfungiblePositionManagerService.createAndInitializePoolIfNecessaryAndMint(
          chainId,
          {
            token0: sortedToken0Address,
            token1: sortedToken1Address,
            fee: params.fee,
            tickLower: params.tickLower,
            tickUpper: params.tickUpper,
            amount0Desired: parseUnits(
              sortedAmount0Desired,
              sortedToken0.coinDecimals,
            ),
            amount1Desired: parseUnits(
              sortedAmount1Desired,
              sortedToken1.coinDecimals,
            ),
            amount0Min: parseUnits(sortedAmount0Min, sortedToken0.coinDecimals),
            amount1Min: parseUnits(sortedAmount1Min, sortedToken1.coinDecimals),
            recipient: params.recipient,
            deadline: params.deadline,
            sqrtPriceX96: params.sqrtPriceX96,
          },
          value,
        );

      return result;
    },
    onSuccess: (hash) => {
      if (hash) {
        // TODO: Make positions fetch a query.
        queryClient.invalidateQueries({
          queryKey: ["usePositions"],
        });
      }
    },
  });

  const mint = useCallback(
    async (params: MintParams) => {
      try {
        const result = await mutation.mutateAsync(params);
        return result;
      } catch (error) {
        console.error("Error in mint:", error);
        throw error;
      }
    },
    [mutation],
  );

  return {
    mint,
    ...mutation,
  };
};
