import { InfoTooltip, Skeleton } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { PriceCardProps } from "../types";

export function PriceCard({
  leftLabel,
  rightLabel,
  tooltipText,
  value,
  className,
}: PriceCardProps) {
  return (
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
        {/* TODO: add loading state */}
        <Skeleton isLoading={false} className="w-12 h-5">
          <span className="text-2xl font-medium">{value}</span>
        </Skeleton>
      </div>
    </div>
  );
}
