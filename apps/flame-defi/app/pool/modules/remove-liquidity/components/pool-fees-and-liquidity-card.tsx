import { useIntl } from "react-intl";

import { Skeleton, TokenIcon } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { PoolToken } from "pool/types";

export const PoolFeesAndLiquidityCard = ({
  poolTokens,
  className,
  liquidityToRemove,
}: {
  poolTokens: PoolToken[];
  className: string;
  liquidityToRemove: PoolToken[];
}) => {
  const { formatNumber } = useIntl();

  return (
    <div className={cn("flex-1 bg-surface-1 rounded-lg p-6", className)}>
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          <Skeleton
            isLoading={liquidityToRemove.length === 0}
            className="h-16 w-full"
          >
            {liquidityToRemove.map(({ token, liquidity }, index) => (
              <div
                key={index}
                className="flex justify-between items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base text-text-subdued">
                    Pooled {token.coinDenom}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-2 text-base text-text-subdued">
                    {formatNumber(liquidity, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    })}
                    <TokenIcon symbol={token.coinDenom} size={20} />
                  </span>
                </div>
              </div>
            ))}
          </Skeleton>
        </div>
        <hr className="border-t border-border mt-4 mb-4" />
        <div className="flex flex-col gap-4">
          <Skeleton isLoading={poolTokens.length === 0} className="h-16 w-full">
            {poolTokens.map(({ token, unclaimedFees }, index) => (
              <div
                key={index}
                className="flex justify-between items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base text-text-subdued">
                    {token.coinDenom} Fees Earned
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-2 text-base text-text-subdued">
                    {formatNumber(unclaimedFees, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    })}
                    <TokenIcon symbol={token.coinDenom} size={20} />
                  </span>
                </div>
              </div>
            ))}
          </Skeleton>
        </div>
      </div>
    </div>
  );
};
