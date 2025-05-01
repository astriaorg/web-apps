import { PriceRangeCardProps } from "pool/types";

import { InfoTooltip } from "@repo/ui/components";
import { cn } from "@repo/ui/utils";

export function PositionInfoCard({
  leftLabel,
  rightLabel,
  tooltipText,
  value,
  className,
}: PriceRangeCardProps) {
  return (
    <div className={cn("flex-1 bg-surface-1 rounded-lg p-6", className)}>
      <div className="flex flex-col space-y-6">
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
        <div className="flex flex-col gap-2">
          <span className="bg-transparent border-none outline-none text-5xl/12 font-dot text-text placeholder:text-text-light">
            {value}
          </span>
        </div>
      </div>
    </div>
  );
}
