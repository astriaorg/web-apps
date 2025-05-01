import { TokenInfoCard } from "pool/components";
import { PoolToken } from "pool/types";

import { Badge, MultiTokenIcon, Skeleton } from "@repo/ui/components";
import { DotIcon } from "@repo/ui/icons";

export const TokenLiquidityBlock = ({
  poolToken0,
  poolToken1,
  feeTier,
}: {
  poolToken0: PoolToken | null;
  poolToken1: PoolToken | null;
  feeTier: string;
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex flex-col space-y-3 flex-1 bg-surface-1 rounded-lg p-4 justify-center">
        <Skeleton
          isLoading={!poolToken0 || !poolToken1}
          className="w-full h-[64px]"
        >
          {poolToken0 && poolToken1 && (
            <div className="flex flex-col space-x-2">
              <MultiTokenIcon
                symbols={[
                  poolToken0.token.coinDenom,
                  poolToken1.token.coinDenom,
                ]}
                size={24}
              />
              <h1 className="text-2xl/8">
                {poolToken0.token.coinDenom}/{poolToken1.token.coinDenom}
              </h1>
            </div>
          )}
        </Skeleton>
        <div className="flex space-x-2">
          <Skeleton
            isLoading={!poolToken0 || !poolToken1}
            className="w-full h-[24px]"
          >
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
          </Skeleton>
        </div>
      </div>
      <div className="flex flex-col space-y-3 flex-1 bg-surface-1 rounded-lg p-4">
        <TokenInfoCard
          poolToken0={poolToken0}
          poolToken1={poolToken1}
          className="p-0"
          showLiquidity={true}
        />
        <hr className="border-t border-border mt-2 mb-2" />
        <Skeleton
          isLoading={!poolToken0 || !poolToken1}
          className="w-full h-[24px]"
        >
          <div className="flex justify-between">
            <span className="text-base text-text-subdued">Fee Tier</span>
            <span className="text-base text-text-subdued">{feeTier}</span>
          </div>
        </Skeleton>
      </div>
    </div>
  );
};
