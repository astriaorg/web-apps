import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useAccount, useConfig } from "wagmi";

import type { EvmCurrency } from "@repo/flame-types";
import { useAstriaChainData } from "config";
import { createNonfungiblePositionManagerService } from "features/evm-wallet";
import { type Position } from "pool/types";
import { getTokenFromAddress } from "pool/utils";

const STALE_TIME_MILLISECONDS = 1000 * 30; // 30 seconds.
const CACHE_TIME_MILLISECONDS = 1000 * 60 * 5; // 5 minutes.

export type GetPositionResult = {
  position: Position;
  token0: EvmCurrency;
  token1: EvmCurrency;
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
    queryKey: ["useGetPosition", chain.chainId, tokenId],
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

      // const unclaimedFees0 = formatUnits(position.tokensOwed0, token0.coinDecimals)
      // const unclaimedFees1 = formatUnits(position.tokensOwed1, token1.coinDecimals)

      return {
        position,
        token0,
        token1,
      };
    },
    enabled: !!address,
    staleTime: STALE_TIME_MILLISECONDS,
    gcTime: CACHE_TIME_MILLISECONDS,
  });
};
