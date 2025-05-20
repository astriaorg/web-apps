import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAccount, useConfig } from "wagmi";

import { useAstriaChainData } from "config";
import {
  type CreateAndInitializePoolIfNecessaryAndMintParams,
  createNonfungiblePositionManagerService,
} from "features/evm-wallet";
import { QUERY_KEYS } from "pool/constants/query-keys";

export const useMint = () => {
  const queryClient = useQueryClient();
  const config = useConfig();
  const { address } = useAccount();
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
        void queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.USE_GET_POSITIONS, chain.chainId, address],
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
