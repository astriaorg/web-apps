import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAstriaChainData } from "config";
import { useCallback } from "react";
import { useConfig } from "wagmi";

import {
  type CreateAndInitializePoolIfNecessaryAndMintParams,
  createNonfungiblePositionManagerService,
} from "features/evm-wallet";

export const useCreateAndInitializePoolIfNecessaryAndMint = () => {
  const queryClient = useQueryClient();
  const config = useConfig();
  const { chain } = useAstriaChainData();

  const mutation = useMutation({
    mutationFn: async (
      params: CreateAndInitializePoolIfNecessaryAndMintParams,
    ) => {
      const nonfungiblePositionManagerService =
        createNonfungiblePositionManagerService(
          config,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const result =
        await nonfungiblePositionManagerService.createAndInitializePoolIfNecessaryAndMint(
          params,
        );

      return result;
    },
    onSuccess: (hash) => {
      if (hash) {
        // TODO: Make positions fetch a query.
        void queryClient.invalidateQueries({
          queryKey: ["usePositions"],
        });
      }
    },
  });

  const mint = useCallback(
    async (params: CreateAndInitializePoolIfNecessaryAndMintParams) => {
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
