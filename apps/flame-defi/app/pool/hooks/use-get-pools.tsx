import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { Pool } from "@uniswap/v3-sdk";
import { useMemo } from "react";
import { type Address, zeroAddress } from "viem";
import { useConfig } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";
import { useAstriaChainData } from "config";
import { createPoolFactoryService } from "features/evm-wallet";
import { QUERY_KEYS } from "pool/constants/query-keys";
import { FEE_TIERS, type FeeTier } from "pool/types";

type GetPoolsResult = {
  [key in FeeTier]: Pool | null;
};

export const useGetPools = (params: {
  token0?: EvmCurrency;
  token1?: EvmCurrency;
}): UseQueryResult<GetPoolsResult | null> => {
  const config = useConfig();
  const { chain } = useAstriaChainData();

  // Don't care what order the tokens are in for better caching.
  const queryKey = useMemo(() => {
    const token0Key = params.token0?.asToken().address;
    const token1Key = params.token1?.asToken().address;

    return [token0Key, token1Key].sort().join("-");
  }, [params.token0, params.token1]);

  return useQuery({
    enabled: !!params.token0 && !!params.token1,
    queryKey: [QUERY_KEYS.USE_GET_POOLS, queryKey, chain],
    queryFn: async () => {
      if (!params.token0 || !params.token1) {
        return null;
      }

      const poolFactoryService = createPoolFactoryService(
        config,
        chain.contracts.poolFactory.address,
      );

      const token0 = params.token0.asToken();
      const token1 = params.token1.asToken();

      const pools = await poolFactoryService.getPools(
        FEE_TIERS.map((it) => ({
          token0: token0.address as Address,
          token1: token1.address as Address,
          fee: it,
        })),
      );

      const validPools = pools.filter((it) => it !== zeroAddress);

      const results =
        await poolFactoryService.getLiquidityAndSlot0ForPools(validPools);

      const result = {} as GetPoolsResult;

      for (let i = 0; i < FEE_TIERS.length; i++) {
        const feeTier = FEE_TIERS[i] as FeeTier;

        const liquidityAndSlot0Result = results.find(
          (it) => it.address === pools[i],
        );

        if (!liquidityAndSlot0Result) {
          result[feeTier] = null;
          continue;
        }

        const pool = new Pool(
          token0,
          token1,
          feeTier,
          liquidityAndSlot0Result.slot0.sqrtPriceX96.toString(),
          liquidityAndSlot0Result.liquidity.toString(),
          liquidityAndSlot0Result.slot0.tick,
        );

        result[feeTier] = pool;
      }

      return result;
    },
  });
};
