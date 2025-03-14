import { cn } from "@repo/ui/utils";
import { forwardRef } from "react";

/**
 * Recharts tooltip doesn't allow for positioning tooltip on Y above the line.
 * This component is a workaround, revisit in Recharts v3 as more internal state will be exposed and can maybe support this.
 */
export const ChartTooltip = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("text-brand text-sm text-center", className)}
      {...props}
    />
  );
});
ChartTooltip.displayName = "ChartTooltip";
