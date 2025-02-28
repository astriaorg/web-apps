"use client";

import { FormatNumberOptions, FormattedNumber } from "../../../intl";
import { cn } from "../../../utils";
import { Skeleton } from "../../atoms";

export interface AnimatedCounterProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  counter: number | null;
  options?: FormatNumberOptions;
  /**
   * Used for syncing animation state between multiple cards.
   */
  isSyncingAnimation?: boolean;
}

export const AnimatedCounter = ({
  value,
  counter,
  options,
  isSyncingAnimation,
  className,
  ...props
}: AnimatedCounterProps) => {
  return (
    <div className="relative">
      {/* Reserve space for animation to prevent card size increasing with counter value. */}
      <span className={cn("opacity-0", className)} {...props}>
        <FormattedNumber value={value} {...options} />
      </span>
      <span
        className={cn("w-full absolute top-0 left-0", className)}
        {...props}
      >
        <Skeleton isLoading={!counter || !isSyncingAnimation}>
          <span>
            <FormattedNumber value={counter ?? 0} {...options} />
          </span>
        </Skeleton>
      </span>
    </div>
  );
};
