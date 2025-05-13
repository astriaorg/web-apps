import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { Pool } from "@uniswap/v3-sdk";
import { useAstriaChainData } from "config";
import { type Address, zeroAddress } from "viem";
import { useConfig } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";
import { createPoolFactoryService } from "features/evm-wallet";
import { FEE_TIERS, type FeeTier } from "pool/types";
import { getTokenFromInternalToken } from "pool/utils";

type GetPoolsResult = {
  [key in FeeTier]: Pool | null;
};

export const useGetPools = (params: {
  token0?: EvmCurrency;
  token1?: EvmCurrency;
}): UseQueryResult<GetPoolsResult | null> => {
  const config = useConfig();
  const { chain } = useAstriaChainData();

  return useQuery({
    // TODO: For better caching, don't care what order the tokens are passed in.
    enabled: !!params.token0 && !!params.token1,
    queryKey: ["useGetPools", params.token0, params.token1, chain],
    queryFn: async () => {
      if (!params.token0 || !params.token1) {
        return null;
      }

      const poolFactoryService = createPoolFactoryService(
        config,
        chain.contracts.poolFactory.address,
      );

      const token0 = getTokenFromInternalToken(params.token0, chain);
      const token1 = getTokenFromInternalToken(params.token1, chain);

      const pools = await poolFactoryService.getPools(
        FEE_TIERS.map((it) => ({
          token0: token0.address as Address,
          token1: token1.address as Address,
          fee: it,
        })),
      );

      const validPools = pools.filter((it) => it !== zeroAddress);

      // TODO: Promise.all or combine multicall.
      const slot0Results =
        await poolFactoryService.getSlot0ForPools(validPools);
      const liquidityResults =
        await poolFactoryService.getLiquidityForPools(validPools);

      const result = {} as GetPoolsResult;

      for (let i = 0; i < FEE_TIERS.length; i++) {
        const feeTier = FEE_TIERS[i] as FeeTier;

        const slot0Result = slot0Results.find((it) => it.address === pools[i]);
        const liquidityResult = liquidityResults.find(
          (it) => it.address === pools[i],
        );

        if (!slot0Result || !liquidityResult) {
          result[feeTier] = null;
          continue;
        }

        const pool = new Pool(
          token0,
          token1,
          feeTier,
          slot0Result.slot0.sqrtPriceX96.toString(),
          liquidityResult.liquidity.toString(),
          slot0Result.slot0.tick,
        );

        result[feeTier] = pool;
      }

      return result;
    },
  });
};
