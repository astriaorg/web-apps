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
  type DepositType,
  type FeeTier,
  MAX_PRICE_DEFAULT,
  MIN_PRICE_DEFAULT,
  type Position,
} from "pool/types";
import {
  calculateDepositType,
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
  depositType: DepositType;
};

/**
 *
 * Get position data from the pool.
 * If `invert` is true, token0, token1 and their calculated amounts will be swapped in the result.
 *
 * **Do not token data in the position itself, as it may not be in the correct order.**
 */
export const useGetPosition = ({
  positionId,
  invert,
}: {
  positionId: string;
  invert: boolean;
}): UseQueryResult<GetPositionResult | null> => {
  const config = useConfig();
  const { address } = useAccount();
  const { chain } = useAstriaChainData();

  return useQuery({
    queryKey: [QUERY_KEYS.USE_GET_POSITION, chain.chainId, positionId],
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
        positionId,
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

      return {
        position,
        token0,
        token1,
        slot0,
      };
    },
    // Handle inversion in the select function to prevent duplicate caching when display order changes.
    select: (data) => {
      if (!data) {
        return null;
      }

      const { position, slot0 } = data;

      let { amount0, amount1, price } = calculateTokenAmountsFromPosition({
        position,
        sqrtPriceX96: slot0.sqrtPriceX96,
        token0: data.token0,
        token1: data.token1,
      });

      let token0 = data.token0;
      let token1 = data.token1;
      if (invert) {
        token0 = data.token1;
        token1 = data.token0;
      }

      const { minTick, maxTick } = getMinMaxTick(position.fee as FeeTier);

      let { minPrice, maxPrice } = (() => {
        let minPrice = tickToPrice(
          token1.asToken(),
          token0.asToken(),
          position.tickLower,
        );
        let maxPrice = tickToPrice(
          token1.asToken(),
          token0.asToken(),
          position.tickUpper,
        );

        if (minPrice.greaterThan(maxPrice)) {
          [minPrice, maxPrice] = [maxPrice, minPrice];
        }

        return {
          minPrice: minPrice.toFixed(token0.coinDecimals),
          maxPrice: maxPrice.toFixed(token0.coinDecimals),
        };
      })();

      if (position.tickLower === minTick) {
        minPrice = MIN_PRICE_DEFAULT.toString();
      }

      if (position.tickUpper === maxTick) {
        maxPrice = MAX_PRICE_DEFAULT.toString();
      }

      const hasUnclaimedFees =
        position.tokensOwed0 > 0n || position.tokensOwed1 > 0n;

      let unclaimedFees0 = formatUnits(
        position.tokensOwed0,
        data.token0.coinDecimals,
      );
      let unclaimedFees1 = formatUnits(
        position.tokensOwed1,
        data.token1.coinDecimals,
      );

      if (invert) {
        unclaimedFees0 = formatUnits(position.tokensOwed1, token1.coinDecimals);
        unclaimedFees1 = formatUnits(position.tokensOwed0, token0.coinDecimals);
        const amount0Original = amount0;
        amount0 = amount1;
        amount1 = amount0Original;
        price = (1 / Number(price)).toString();
      }

      const depositType = calculateDepositType({
        currentPrice: Number(price),
        minPrice: Number(minPrice),
        maxPrice: Number(maxPrice),
      });

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
        depositType,
      };
    },
    enabled: !!address,
    staleTime: STALE_TIME_MILLISECONDS,
    gcTime: CACHE_TIME_MILLISECONDS,
  });
};
