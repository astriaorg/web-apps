import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAstriaChainData } from "config";
import { useAccount, useConfig } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";
import {
  createNonfungiblePositionManagerService,
  createPoolFactoryService,
} from "features/evm-wallet";
import { type FeeTier, type PositionWithKey } from "pool/types";
import { getTokenFromAddress } from "pool/utils";

export type GetPositionsResult = {
  position: PositionWithKey;
  token0: EvmCurrency;
  token1: EvmCurrency;
  address: string;
  feeTier: FeeTier;
};

export const useGetPositions = (): UseQueryResult<
  GetPositionsResult[] | null
> => {
  const config = useConfig();
  const { address } = useAccount();
  const { chain } = useAstriaChainData();

  return useQuery({
    queryKey: ["useGetPositions", chain.chainId, address],
    queryFn: async () => {
      if (!address) {
        return;
      }

      const nonfungiblePositionManagerService =
        createNonfungiblePositionManagerService(
          config,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const positions = await nonfungiblePositionManagerService.getPositions(
        chain.chainId,
        address,
      );

      const promises = positions.map(async (position) => {
        const feeTier = (position.fee / 1000000) as FeeTier;

        const token0 = getTokenFromAddress(position.token0, chain);
        const token1 = getTokenFromAddress(position.token1, chain);

        if (!token0 || !token1) {
          throw new Error("Tokens in position not found.");
        }

        const poolFactoryService = createPoolFactoryService(
          config,
          chain.contracts.poolFactory.address,
        );

        const address = await poolFactoryService.getPool(
          chain.chainId,
          position.token0,
          position.token1,
          position.fee,
        );

        return {
          token0,
          token1,
          feeTier,
          address,
          position,
        };
      });

      const result = await Promise.all(promises);

      console.log("Result", result);

      return result;
    },
  });
};
