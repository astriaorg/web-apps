import { InfoTooltip, Skeleton } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";

import { PriceRangeCardProps } from "../types";

export function PriceRangeCard({
  leftLabel,
  rightLabel,
  tooltipText,
  value,
  className,
  variant = "default",
}: PriceRangeCardProps) {
  return (
    <>
      {variant === "default" && (
        <div className={cn("flex-1 bg-surface-1 rounded-lg p-4", className)}>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center gap-2">
              {leftLabel && (
                <span className="flex items-center gap-2 text-sm text-text-subdued">
                  {leftLabel}
                  {tooltipText && <InfoTooltip content={tooltipText} />}
                </span>
              )}
              {rightLabel && (
                <span className="text-sm text-text-subdued">{rightLabel}</span>
              )}
            </div>
            <Skeleton isLoading={!value} className="w-1/2 h-8">
              <span className="text-2xl font-medium">{value}</span>
            </Skeleton>
          </div>
        </div>
      )}
      {variant === "small" && (
        <div className={cn("flex-1", className)}>
          <div className="flex flex-row justify-between gap-2">
            <div className="flex justify-between items-center gap-2">
              {leftLabel && (
                <span className="flex items-center gap-2 text-text-subdued">
                  {leftLabel}
                  {tooltipText && <InfoTooltip content={tooltipText} />}
                </span>
              )}
              {rightLabel && (
                <span className="text-text-subdued">{rightLabel}</span>
              )}
            </div>
            <Skeleton isLoading={!value} className="w-1/2 h-8">
              <span className="">{value}</span>
            </Skeleton>
          </div>
        </div>
      )}
    </>
  );
}
