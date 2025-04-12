import { Badge, Skeleton, TokenIcon } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { PoolToken } from "pool/types";
import { useIntl } from "react-intl";

export function TokenInfoCard({
  poolToken0,
  poolToken1,
  showLiquidity = false,
  showLiquidityPercentage = false,
  className,
}: {
  poolToken0: PoolToken | null;
  poolToken1: PoolToken | null;
  showLiquidity?: boolean;
  showLiquidityPercentage?: boolean;
  className?: string;
}) {
  const { formatNumber } = useIntl();

  return (
    <div className={cn("flex-1 bg-surface-1 rounded-lg p-6", className)}>
      <div className="flex flex-col space-y-4">
        <Skeleton
          className="w-full h-[64px]"
          isLoading={!poolToken0 || !poolToken1}
        >
          <div className="flex flex-col gap-4">
            {poolToken0 &&
              poolToken1 &&
              [poolToken0, poolToken1].map(
                (
                  { token, liquidity, unclaimedFees, liquidityPercentage },
                  index,
                ) => (
                  <div
                    key={index}
                    className="flex justify-between items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <TokenIcon symbol={token.coinDenom} size={20} />
                      <span className="text-base text-text-subdued">
                        {token.coinDenom}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base text-text-subdued">
                        {showLiquidity
                          ? formatNumber(liquidity, {
                              minimumFractionDigits: 6,
                              maximumFractionDigits: 6,
                            })
                          : formatNumber(unclaimedFees, {
                              minimumFractionDigits: 6,
                              maximumFractionDigits: 6,
                            })}
                      </span>
                      {showLiquidityPercentage && (
                        <Badge variant="default">{liquidityPercentage}%</Badge>
                      )}
                    </div>
                  </div>
                ),
              )}
          </div>
        </Skeleton>
      </div>
    </div>
  );
}
