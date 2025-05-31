import type { EvmCurrency } from "@repo/flame-types";
import type { GetPositionsResult } from "pool/hooks/use-get-positions";
import { FEE_TIER, type PositionWithPositionId } from "pool/types";

export const getPlaceholderData = (length: number): GetPositionsResult[] =>
  Array.from({ length }).map(
    (_, index) =>
      ({
        position: {
          positionId: "1000",
          liquidity: 0n,
        } as PositionWithPositionId,
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
        amount0: "0",
        amount1: "0",
        price: "0",
      }) as GetPositionsResult,
  );
