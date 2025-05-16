import { Badge, MultiTokenIcon, Skeleton } from "@repo/ui/components";
import { DotIcon } from "@repo/ui/icons";
import { usePoolPositionContext } from "pool/hooks";
import { PoolToken } from "pool/types";

import { PoolFeesAndLiquidityCard } from "./pool-fees-and-liquidity-card";

export const TokenLiquidityBlock = ({
  liquidityToRemove,
}: {
  liquidityToRemove: PoolToken[];
}) => {
  const { token0, token1, feeTier } = usePoolPositionContext();
  const isLoading = !token0?.token.coinDenom || !token1?.token.coinDenom;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex flex-col space-y-3 flex-1 bg-surface-1 rounded-lg p-4 justify-center">
        <Skeleton isLoading={isLoading} className="h-16 w-full">
          {!isLoading && (
            <div className="flex flex-col space-x-2">
              <MultiTokenIcon
                symbols={[token0.token.coinDenom, token1.token.coinDenom]}
                size={24}
              />
              <h1 className="text-2xl/8 mt-2">
                {token0.token.coinDenom}/{token1.token.coinDenom}
              </h1>
            </div>
          )}
        </Skeleton>
        <Skeleton isLoading={!feeTier || isLoading} className="h-8 w-full">
          <div className="flex space-x-2">
            <Badge
              variant="default"
              className="flex items-center space-x-2 z-2"
            >
              <DotIcon size={12} className="fill-green z-999999999" />
              <span>In range</span>
            </Badge>
            <Badge variant="default" className="flex items-center space-x-2">
              {feeTier}
            </Badge>
          </div>
        </Skeleton>
      </div>
      <div className="flex flex-col flex-1 bg-surface-1 rounded-lg p-4">
        <PoolFeesAndLiquidityCard
          tokens={token0 && token1 ? [token0, token1] : []}
          className="p-0"
          liquidityToRemove={liquidityToRemove}
        />
      </div>
    </div>
  );
};
