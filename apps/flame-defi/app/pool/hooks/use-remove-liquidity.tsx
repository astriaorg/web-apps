import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAccount, useConfig, usePublicClient } from "wagmi";

import { useAstriaChainData } from "config";
import {
  createNonfungiblePositionManagerService,
  type DecreaseLiquidityAndCollectParams,
} from "features/evm-wallet";
import { QUERY_KEYS } from "pool/constants/query-keys";
import { usePoolPositionContext } from "pool/hooks/use-pool-position-context-v2";

export const useRemoveLiquidity = () => {
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();
  const config = useConfig();
  const { positionId } = usePoolPositionContext();
  const { address } = useAccount();
  const { chain } = useAstriaChainData();

  const mutation = useMutation({
    mutationFn: async (params: DecreaseLiquidityAndCollectParams) => {
      if (!address || !positionId) {
        throw new Error("Missing required data for removing liquidity.");
      }

      const nonfungiblePositionService =
        createNonfungiblePositionManagerService(
          config,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const hash =
        await nonfungiblePositionService.decreaseLiquidityAndCollect(params);

      return hash;
    },
    onSuccess: async (hash) => {
      if (hash) {
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
          });
          if (receipt.status === "success") {
            // Add a small delay to ensure blockchain state is updated.
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        void queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.USE_GET_POSITION, chain.chainId, positionId],
        });

        void queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.USE_GET_POSITIONS, chain.chainId, address],
        });
      }
    },
    onError: (error) => {
      console.warn("Error removing liquidity:", error);
    },
  });

  const removeLiquidity = useCallback(
    async (params: DecreaseLiquidityAndCollectParams) => {
      try {
        const result = await mutation.mutateAsync(params);
        return result;
      } catch (error) {
        console.error("Error in remove liquidity:", error);
        throw error;
      }
    },
    [mutation],
  );

  return {
    removeLiquidity,
    ...mutation,
  };
};
