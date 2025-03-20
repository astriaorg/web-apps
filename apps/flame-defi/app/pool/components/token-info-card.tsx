import { Badge, TokenIcon } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { PoolTokenData } from "pool/types";

export function TokenInfoCard({
  poolTokenData,
  showLiquidity = false,
  className,
}: {
  poolTokenData: PoolTokenData[];
  showLiquidity?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 bg-surface-1 rounded-lg p-6", className)}>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col gap-4">
          {poolTokenData.map((token, index) => (
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
                  {showLiquidity ? token.liquidity : token.unclaimedFees}
                </span>
                {showLiquidity && (
                  <Badge variant="default">{token.liquidityPercentage}%</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
