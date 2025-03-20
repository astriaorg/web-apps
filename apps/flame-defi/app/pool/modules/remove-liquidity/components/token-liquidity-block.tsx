import { Badge, MultiTokenIcon, Skeleton } from "@repo/ui/components";
import { DotIcon } from "@repo/ui/icons";
import { usePoolDetailsContext } from "pool/hooks";
import { PoolFeesAndLiquidityCard } from "./pool-fees-and-liquidity-card";
import { TokenPriceData } from "pool/types";

export const TokenLiquidityBlock = ({ valuesToRemove }: { valuesToRemove: TokenPriceData[] }) => {
  const { tokenData, feeTier } = usePoolDetailsContext();

  return (
    <div className="flex gap-4">
      <div className="flex flex-col space-y-3 flex-1 bg-surface-1 rounded-lg p-4 justify-center">
        {/* TODO: loading state */}
        <Skeleton isLoading={false} className="">
          <div className="flex flex-col space-x-2">
            <MultiTokenIcon
              symbols={tokenData.map((token) => token.symbol)}
              size={24}
            />
            <h1 className="text-2xl/8 mt-2">
              {tokenData[0]?.symbol}/{tokenData[1]?.symbol}
            </h1>
          </div>
        </Skeleton>
        {/* TODO: loading state */}
        <Skeleton isLoading={false} className="">
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
        <PoolFeesAndLiquidityCard tokenData={tokenData} className="p-0" valuesToRemove={valuesToRemove}/>
      </div>
    </div>
  );
};
