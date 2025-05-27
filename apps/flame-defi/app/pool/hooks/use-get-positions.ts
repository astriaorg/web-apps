import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAccount, useConfig } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";
import { useAstriaChainData } from "config";
import {
  createNonfungiblePositionManagerService,
  createPoolFactoryService,
} from "features/evm-wallet";
import { QUERY_KEYS } from "pool/constants/query-keys";
import { type PositionWithPositionId } from "pool/types";
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
  position: PositionWithPositionId;
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

      const getPositionKey = (position: PositionWithPositionId) => {
        return `${position.token0}-${position.token1}-${position.fee}`;
      };

      // Get liquidity and slot0 information for all positions.
      // There is only one pool per token pair and fee, which can have multiple positions, so we only need to fetch data for unique pools.
      const uniquePositionsRecord = positions.reduce(
        (acc, position) => {
          const key = getPositionKey(position);
          if (!acc[key]) {
            acc[key] = position;
          }
          return acc;
        },
        {} as Record<string, PositionWithPositionId>,
      );
      const uniquePools = await poolFactoryService.getPools(
        Object.values(uniquePositionsRecord),
      );
      const uniqueLiquidityAndSlot0ForPools =
        await poolFactoryService.getLiquidityAndSlot0ForPools(uniquePools);

      const positionsWithLiquidityAndSlot0 = positions.map((position) => {
        const key = getPositionKey(position);
        const uniquePositionsKeys = Object.keys(uniquePositionsRecord);
        const index = uniquePositionsKeys.findIndex((it) => it === key);
        const uniquePool = uniquePools[index];
        const uniqueLiquidityAndSlot0 = uniqueLiquidityAndSlot0ForPools[index];

        if (!uniquePool || !uniqueLiquidityAndSlot0) {
          throw new Error("No matching pool for position found.");
        }

        return {
          ...position,
          address: uniquePool,
          liquidity: uniqueLiquidityAndSlot0.liquidity,
          slot0: uniqueLiquidityAndSlot0.slot0,
        };
      });

      return positionsWithLiquidityAndSlot0.map((position) => {
        const token0 = getTokenFromAddress(position.token0, chain);
        const token1 = getTokenFromAddress(position.token1, chain);

        if (!token0 || !token1) {
          throw new Error("Tokens in position not found.");
        }

        const { amount0, amount1, price } = calculateTokenAmountsFromPosition({
          position,
          sqrtPriceX96: position.slot0.sqrtPriceX96,
          token0,
          token1,
        });

        return {
          position,
          pool: {
            address: position.address,
            token0,
            token1,
            liquidity: position.liquidity,
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
    retry: 0,
  });
};
