import { Badge, Skeleton, TokenIcon } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { PoolToken } from "pool/types";
import { useIntl } from "react-intl";

export function TokenInfoCard({
  poolTokens,
  showLiquidity = false,
  className,
}: {
  poolTokens: PoolToken[];
  showLiquidity?: boolean;
  className?: string;
}) {
  const { formatNumber } = useIntl();

  return (
    <div className={cn("flex-1 bg-surface-1 rounded-lg p-6", className)}>
      <div className="flex flex-col space-y-4">
        <Skeleton
          className="w-full h-[64px]"
          isLoading={poolTokens.length === 0}
        >
          <div className="flex flex-col gap-4">
            {poolTokens.map((token, index) => (
              <div
                key={index}
                className="flex justify-between items-center gap-2"
              >
                <div className="flex items-center gap-2">
                  <TokenIcon symbol={token.symbol} size={20} />
                  <span className="text-base text-text-subdued">
                    {token.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base text-text-subdued">
                    {showLiquidity
                      ? formatNumber(token.liquidity, {
                          minimumFractionDigits: 5,
                          maximumFractionDigits: 5,
                        })
                      : formatNumber(token.unclaimedFees, {
                          minimumFractionDigits: 5,
                          maximumFractionDigits: 5,
                        })}
                  </span>
                  {showLiquidity && (
                    <Badge variant="default">
                      {token.liquidityPercentage}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Skeleton>
      </div>
    </div>
  );
}
