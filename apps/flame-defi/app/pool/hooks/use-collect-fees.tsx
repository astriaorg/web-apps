import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAccount, useConfig } from "wagmi";

import { useAstriaChainData } from "config";
import {
  type CollectFeesV2Params,
  createNonfungiblePositionManagerService,
} from "features/evm-wallet";
import { QUERY_KEYS } from "pool/constants/query-keys";
import { usePoolPositionContext } from "pool/hooks/use-pool-position-context-v2";

export const useCollectFees = () => {
  const queryClient = useQueryClient();
  const config = useConfig();
  const { tokenId } = usePoolPositionContext();
  const { address } = useAccount();
  const { chain } = useAstriaChainData();

  const mutation = useMutation({
    mutationFn: async (params: CollectFeesV2Params) => {
      if (!address || !tokenId || !tokenId) {
        throw new Error("Missing required data for collecting fees.");
      }

      const nonfungiblePositionService =
        createNonfungiblePositionManagerService(
          config,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const result = await nonfungiblePositionService.collectFeesV2(params);

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
      console.warn("Error collecting fees:", error);
    },
  });

  const collectFees = useCallback(
    async (params: CollectFeesV2Params) => {
      try {
        const result = await mutation.mutateAsync(params);
        return result;
      } catch (error) {
        console.error("Error in collect fees:", error);
        throw error;
      }
    },
    [mutation],
  );

  return {
    collectFees,
    ...mutation,
  };
};
