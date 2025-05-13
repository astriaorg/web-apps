import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { Token } from "@uniswap/sdk-core";
import { Pool } from "@uniswap/v3-sdk";
import { useAstriaChainData } from "config";
import { type Address, zeroAddress } from "viem";
import { useConfig } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";
import { createPoolFactoryService } from "features/evm-wallet";
import { FEE_TIERS, type FeeTier } from "pool/types";

type GetPoolsResult = {
  [key in FeeTier]: Pool | null;
};

export const useGetPools = ({
  token0,
  token1,
}: {
  token0?: EvmCurrency;
  token1?: EvmCurrency;
}): UseQueryResult<GetPoolsResult | null> => {
  const config = useConfig();
  const { chain } = useAstriaChainData();

  return useQuery({
    // TODO: For better caching, don't care what order the tokens are passed in.
    enabled: !!token0 && !!token1,
    queryKey: ["useGetPools", token0, token1, chain],
    queryFn: async () => {
      if (!token0 || !token1) {
        return null;
      }

      const poolFactoryService = createPoolFactoryService(
        config,
        chain.contracts.poolFactory.address,
      );

      // Handle native tokens. If one of the tokens is native, we need to get the wrapped token address.
      const token0Address = token0.isNative
        ? chain.contracts.wrappedNativeToken.address
        : (token0.erc20ContractAddress as Address);
      const token1Address = token1.isNative
        ? chain.contracts.wrappedNativeToken.address
        : (token1.erc20ContractAddress as Address);

      const pools = await poolFactoryService.getPools(
        FEE_TIERS.map((it) => ({
          token0: token0Address,
          token1: token1Address,
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

        const poolToken0 = new Token(
          chain.chainId,
          token0Address,
          token0.coinDecimals,
          token0.coinDenom,
        );
        const poolToken1 = new Token(
          chain.chainId,
          token1Address,
          token1.coinDecimals,
          token1.coinDenom,
        );

        const configuredPool = new Pool(
          poolToken0,
          poolToken1,
          feeTier,
          slot0Result.slot0.sqrtPriceX96.toString(),
          liquidityResult.liquidity.toString(),
          slot0Result.slot0.tick,
        );

        result[feeTier] = configuredPool;
      }

      return result;
    },
  });
};
