import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAccount, useConfig } from "wagmi";

import { useAstriaChainData } from "config";
import {
  createNonfungiblePositionManagerService,
  type IncreaseLiquidityParams,
} from "features/evm-wallet";
import { QUERY_KEYS } from "pool/constants/query-keys";
import { usePoolPositionContext } from "pool/hooks/use-pool-position-context-v2";

export const useAddLiquidity = () => {
  const queryClient = useQueryClient();
  const config = useConfig();
  const { tokenId } = usePoolPositionContext();
  const { address } = useAccount();
  const { chain } = useAstriaChainData();

  const mutation = useMutation({
    mutationFn: async (params: IncreaseLiquidityParams) => {
      if (!address || !tokenId || !tokenId) {
        throw new Error("Missing required data for adding liquidity.");
      }

      const nonfungiblePositionService =
        createNonfungiblePositionManagerService(
          config,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const result = await nonfungiblePositionService.increaseLiquidity(params);

      return result;
    },
    onSuccess: (hash) => {
      if (hash) {
        void queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.USE_GET_POSITION, chain.chainId, tokenId],
        });

        void queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.USE_GET_POSITIONS, chain.chainId, address],
        });
      }
    },
    onError: (error) => {
      console.warn("Error adding liquidity:", error);
    },
  });

  const addLiquidity = useCallback(
    async (params: IncreaseLiquidityParams) => {
      try {
        const result = await mutation.mutateAsync(params);
        return result;
      } catch (error) {
        console.error("Error in add liquidity:", error);
        throw error;
      }
    },
    [mutation],
  );

  return {
    addLiquidity,
    ...mutation,
  };
};
