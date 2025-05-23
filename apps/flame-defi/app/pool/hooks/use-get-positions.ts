import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAccount, useConfig } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";
import { useAstriaChainData } from "config";
import {
  createNonfungiblePositionManagerService,
  createPoolFactoryService,
} from "features/evm-wallet";
import { QUERY_KEYS } from "pool/constants/query-keys";
import { type PositionWithKey } from "pool/types";
import {
  calculateTokenAmountsFromPosition,
  getTokenFromAddress,
} from "pool/utils";

const STALE_TIME_MILLISECONDS = 1000 * 30; // 30 seconds.
const CACHE_TIME_MILLISECONDS = 1000 * 60 * 5; // 5 minutes.

export type GetPositionsResult = {
  pool: {
    address: string;
    token0: EvmCurrency;
    token1: EvmCurrency;
    liquidity: bigint;
  };
  position: PositionWithKey;
  amount0: string;
  amount1: string;
  price: string;
};

export const useGetPositions = (): UseQueryResult<
  GetPositionsResult[] | null
> => {
  const config = useConfig();
  const { address } = useAccount();
  const { chain } = useAstriaChainData();

  return useQuery({
    queryKey: [QUERY_KEYS.USE_GET_POSITIONS, chain.chainId, address],
    queryFn: async () => {
      if (!address) {
        return null;
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

      const poolFactoryService = createPoolFactoryService(
        config,
        chain.contracts.poolFactory.address,
      );

      const pools = await poolFactoryService.getPools(
        positions.map((position) => ({
          token0: position.token0,
          token1: position.token1,
          fee: position.fee,
        })),
      );

      // TODO: Promise.all or combine multicall.
      const slot0Results = await poolFactoryService.getSlot0ForPools(pools);
      const liquidityResults =
        await poolFactoryService.getLiquidityForPools(pools);

      return positions.map((position, index) => {
        const token0 = getTokenFromAddress(position.token0, chain);
        const token1 = getTokenFromAddress(position.token1, chain);

        if (!token0 || !token1) {
          throw new Error("Tokens in position not found.");
        }
        if (!pools[index] || !slot0Results[index] || !liquidityResults[index]) {
          throw new Error("No matching pool for position found.");
        }

        const { amount0, amount1, price } = calculateTokenAmountsFromPosition({
          position,
          sqrtPriceX96: slot0Results[index]?.slot0.sqrtPriceX96,
          token0,
          token1,
        });

        return {
          position,
          pool: {
            address: pools[index],
            token0,
            token1,
            liquidity: (liquidityResults[index] as { liquidity: bigint })
              .liquidity,
          },
          amount0,
          amount1,
          price,
        };
      });
    },
    enabled: !!address,
    staleTime: STALE_TIME_MILLISECONDS,
    gcTime: CACHE_TIME_MILLISECONDS,
  });
};
