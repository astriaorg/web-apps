import { TokenIcon } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { TokenPriceData } from "pool/types";
import { useIntl } from "react-intl";
export const PoolFeesAndLiquidityCard = ({
  tokenData,
  className,
  valuesToRemove,
}: {
  tokenData: TokenPriceData[];
  className: string;
  valuesToRemove: TokenPriceData[];
}) => {
  const { formatNumber } = useIntl();

  return (
    <div className={cn("flex-1 bg-surface-1 rounded-lg p-6", className)}>
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          {valuesToRemove.map((token, index) => (
            <div
              key={index}
              className="flex justify-between items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-base text-text-subdued">
                  Pooled {token.symbol}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2 text-base text-text-subdued">
                  {formatNumber(token.liquidity, {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6,
                  })}
                  <TokenIcon symbol={token.symbol} size={20} />
                </span>
              </div>
            </div>
          ))}
        </div>
        <hr className="border-t border-border mt-4 mb-4" />
        <div className="flex flex-col gap-4">
          {tokenData.map((token, index) => (
            <div
              key={index}
              className="flex justify-between items-center gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-base text-text-subdued">
                  {token.symbol} Fees Earned
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2 text-base text-text-subdued">
                  {formatNumber(token.unclaimedFees, {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6,
                  })}
                  <TokenIcon symbol={token.symbol} size={20} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
