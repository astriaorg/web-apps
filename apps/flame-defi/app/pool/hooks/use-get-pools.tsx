import type { EvmCurrency } from "@repo/flame-types";
import { isZeroAddress } from "@repo/ui/utils";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useEvmChainData } from "config";
import {
  createPoolFactoryService,
  createPoolService,
} from "features/evm-wallet";
import { FEE_TIERS, type FeeTier } from "pool/constants";
import { calculatePoolExchangeRate } from "pool/utils";
import type { Address } from "viem";
import { useConfig } from "wagmi";

type GetPoolsResult = {
  [key in FeeTier]: {
    address: string;
    rateToken0ToToken1: string;
    rateToken1ToToken0: string;
  } | null;
};

export const useGetPools = ({
  token0,
  token1,
}: {
  token0?: EvmCurrency;
  token1?: EvmCurrency;
}): UseQueryResult<GetPoolsResult> => {
  const config = useConfig();
  const { selectedChain } = useEvmChainData();

  return useQuery({
    // TODO: For better caching, don't care what order the tokens are passed in.
    enabled: !!token0 && !!token1,
    queryKey: ["useGetPool", token0, token1, selectedChain],
    queryFn: async () => {
      console.log("useGetPool");
      if (!token0 || !token1) {
        return null;
      }

      const poolFactoryService = createPoolFactoryService(
        config,
        selectedChain.contracts.poolFactory.address,
      );

      // Handle native tokens. If one of the tokens is native, we need to get the wrapped token address.
      const token0Address = token0.isNative
        ? selectedChain.contracts.wrappedNativeToken.address
        : (token0.erc20ContractAddress as Address);
      const token1Address = token1.isNative
        ? selectedChain.contracts.wrappedNativeToken.address
        : (token1.erc20ContractAddress as Address);

      const pools = await poolFactoryService.getPools(
        token0Address,
        token1Address,
        FEE_TIERS,
      );

      // TODO: Use multicall.
      // Batch the `getSlot0` calls for all pools
      const slot0Results = await Promise.all(
        pools
          .filter((it) => !isZeroAddress(it))
          .map(async (it) => {
            const poolService = createPoolService(config, it);
            return {
              address: it,
              slot0: await poolService.getSlot0(selectedChain.chainId),
            };
          }),
      );

      const result = {} as GetPoolsResult;

      for (let i = 0; i < FEE_TIERS.length; i++) {
        const feeTier = FEE_TIERS[i] as FeeTier;

        const slot0Result = slot0Results.find((it) => it.address === pools[i]);

        if (!slot0Result) {
          result[feeTier] = null;
          continue;
        }

        result[feeTier] = {
          address: pools[feeTier] as string,
          ...calculatePoolExchangeRate({
            decimal0: token0.coinDecimals,
            decimal1: token1.coinDecimals,
            sqrtPriceX96: slot0Result.slot0.sqrtPriceX96,
          }),
        };
      }

      return result;
    },
  });
};
