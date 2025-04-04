import { Badge, MultiTokenIcon, Skeleton } from "@repo/ui/components";
import { DotIcon } from "@repo/ui/icons";
import { usePoolPositionContext } from "pool/hooks";
import { PoolFeesAndLiquidityCard } from "./pool-fees-and-liquidity-card";
import { PoolToken } from "pool/types";

export const TokenLiquidityBlock = ({
  liquidityToRemove,
}: {
  liquidityToRemove: PoolToken[];
}) => {
  const { poolTokenOne, poolTokenTwo, feeTier } = usePoolPositionContext();
  const symbolsReady =
    poolTokenOne?.token.coinDenom && poolTokenTwo?.token.coinDenom;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex flex-col space-y-3 flex-1 bg-surface-1 rounded-lg p-4 justify-center">
        {/* TODO: loading state */}
        <Skeleton isLoading={!symbolsReady} className="">
          {symbolsReady && (
            <div className="flex flex-col space-x-2">
              <MultiTokenIcon
                symbols={[
                  poolTokenOne.token.coinDenom,
                  poolTokenTwo.token.coinDenom,
                ]}
                size={24}
              />
              <h1 className="text-2xl/8 mt-2">
                {poolTokenOne.token.coinDenom}/{poolTokenTwo.token.coinDenom}
              </h1>
            </div>
          )}
        </Skeleton>
        <Skeleton isLoading={!feeTier} className="">
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
        {poolTokenOne && poolTokenTwo && (
          <PoolFeesAndLiquidityCard
            poolTokens={[poolTokenOne, poolTokenTwo]}
            className="p-0"
            liquidityToRemove={liquidityToRemove}
          />
        )}
      </div>
    </div>
  );
};
