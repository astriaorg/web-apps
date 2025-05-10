import type { EvmCurrency } from "@repo/flame-types";
import type { GetPositionsResult } from "pool/hooks/use-get-positions";
import { FEE_TIER, type PositionWithKey } from "pool/types";

export const getPlaceholderData = (length: number): GetPositionsResult[] =>
  Array.from({ length }).map(
    (_, index) =>
      ({
        position: {
          liquidity: 0n,
        } as PositionWithKey,
        pool: {
          token0: {
            coinDenom: `Token${index}`,
          } as EvmCurrency,
          token1: {
            coinDenom: `Token${index + 1}`,
          } as EvmCurrency,
          address: `0x${index}`,
          liquidity: 0n,
          feeTier: FEE_TIER.LOWEST,
        },
      }) as GetPositionsResult,
  );
