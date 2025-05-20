import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { tickToPrice } from "@uniswap/v3-sdk";
import { formatUnits } from "viem";
import { useAccount, useConfig } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";
import { useAstriaChainData } from "config";
import {
  createNonfungiblePositionManagerService,
  createPoolFactoryService,
  createPoolService,
} from "features/evm-wallet";
import { QUERY_KEYS } from "pool/constants/query-keys";
import {
  type FeeTier,
  MAX_PRICE_DEFAULT,
  MIN_PRICE_DEFAULT,
  type Position,
} from "pool/types";
import {
  calculateTokenAmountsFromPosition,
  getMinMaxTick,
  getTokenFromAddress,
} from "pool/utils";

const STALE_TIME_MILLISECONDS = 1000 * 30; // 30 seconds.
const CACHE_TIME_MILLISECONDS = 1000 * 60 * 5; // 5 minutes.

export type GetPositionResult = {
  position: Position;
  token0: EvmCurrency;
  token1: EvmCurrency;
  amount0: string;
  amount1: string;
  price: string;
  minPrice: string;
  maxPrice: string;
  unclaimedFees0: string;
  unclaimedFees1: string;
  hasUnclaimedFees: boolean;
};

export const useGetPosition = ({
  tokenId,
}: {
  tokenId: string;
}): UseQueryResult<GetPositionResult | null> => {
  const config = useConfig();
  const { address } = useAccount();
  const { chain } = useAstriaChainData();

  return useQuery({
    queryKey: [QUERY_KEYS.USE_GET_POSITION, chain.chainId, tokenId],
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const nonfungiblePositionManagerService =
        createNonfungiblePositionManagerService(
          config,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const position = await nonfungiblePositionManagerService.positions(
        chain.chainId,
        tokenId,
      );

      const token0 = getTokenFromAddress(position.token0, chain);
      const token1 = getTokenFromAddress(position.token1, chain);

      if (!token0 || !token1) {
        return null;
      }

      const poolFactoryService = createPoolFactoryService(
        config,
        chain.contracts.poolFactory.address,
      );

      const pool = await poolFactoryService.getPool(
        chain.chainId,
        position.token0,
        position.token1,
        position.fee,
      );

      const poolService = createPoolService(config, pool);
      const slot0 = await poolService.slot0(chain.chainId);

      const { amount0, amount1, price } = calculateTokenAmountsFromPosition({
        position,
        sqrtPriceX96: slot0.sqrtPriceX96,
        token0,
        token1,
      });

      const { minTick, maxTick } = getMinMaxTick(position.fee as FeeTier);

      let minPrice = tickToPrice(
        token0.asToken(),
        token1.asToken(),
        position.tickLower,
      ).toFixed(token0.coinDecimals);
      let maxPrice = tickToPrice(
        token0.asToken(),
        token1.asToken(),
        position.tickUpper,
      ).toFixed();

      if (position.tickLower === minTick) {
        minPrice = MIN_PRICE_DEFAULT.toString();
      }
      if (position.tickUpper === maxTick) {
        maxPrice = MAX_PRICE_DEFAULT.toString();
      }

      const hasUnclaimedFees =
        position.tokensOwed0 > 0n || position.tokensOwed1 > 0n;

      const unclaimedFees0 = formatUnits(
        position.tokensOwed0,
        token0.coinDecimals,
      );
      const unclaimedFees1 = formatUnits(
        position.tokensOwed1,
        token1.coinDecimals,
      );

      return {
        position,
        token0,
        token1,
        amount0,
        amount1,
        price,
        minPrice,
        maxPrice,
        unclaimedFees0,
        unclaimedFees1,
        hasUnclaimedFees,
      };
    },
    enabled: !!address,
    staleTime: STALE_TIME_MILLISECONDS,
    gcTime: CACHE_TIME_MILLISECONDS,
  });
};
