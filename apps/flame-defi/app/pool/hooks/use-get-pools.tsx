import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAstriaChainData } from "config";
import type { Address } from "viem";
import { useConfig } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";
import { isZeroAddress } from "@repo/ui/utils";
import { createPoolFactoryService } from "features/evm-wallet";
import { FEE_TIERS, type FeeTier, type PoolWithSlot0 } from "pool/types";
import { calculatePoolExchangeRate } from "pool/utils";

type GetPoolsResult = {
  [key in FeeTier]: PoolWithSlot0 | null;
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
        token0Address,
        token1Address,
        FEE_TIERS,
      );

      const validPools = pools.filter((it) => !isZeroAddress(it));
      const slot0Results = await poolFactoryService.getPoolsSlot0(validPools);

      const result = {} as GetPoolsResult;

      for (let i = 0; i < FEE_TIERS.length; i++) {
        const feeTier = FEE_TIERS[i] as FeeTier;

        const slot0Result = slot0Results.find((it) => it.address === pools[i]);

        if (!slot0Result) {
          result[feeTier] = null;
          continue;
        }

        result[feeTier] = {
          address: pools[i] as string,
          ...calculatePoolExchangeRate({
            decimal0: token0.coinDecimals,
            decimal1: token1.coinDecimals,
            sqrtPriceX96: slot0Result.slot0.sqrtPriceX96,
          }),
          ...slot0Result.slot0,
        };
      }

      return result;
    },
  });
};
