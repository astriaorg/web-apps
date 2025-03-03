"use client";

import { useCallback } from "react";
import { FormatNumberOptions, useIntl } from "../../../intl";
import { cn, formatAbbreviatedNumber } from "../../../utils";
import { Skeleton } from "../../atoms";

export interface AnimatedCounterProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  counter: number | null;
  options?: FormatNumberOptions;
  showAbbreviatedNumber?: boolean;
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
  showAbbreviatedNumber,
  className,
  ...props
}: AnimatedCounterProps) => {
  const { formatNumber } = useIntl();

  const formatAnimatedCounterNumber = useCallback(
    (
      value: AnimatedCounterProps["value"],
      options: AnimatedCounterProps["options"],
      showAbbreviatedNumber: AnimatedCounterProps["showAbbreviatedNumber"],
    ) => {
      if (showAbbreviatedNumber) {
        const { value: formattedValue, suffix: formattedValueSuffix } =
          formatAbbreviatedNumber(value.toString(), options);
        return `${formattedValue}${formattedValueSuffix}`;
      }

      return formatNumber(value, options);
    },
    [formatNumber],
  );

  return (
    <div className="relative">
      {/* Reserve space for animation to prevent card size increasing with counter value. */}
      <span className={cn("opacity-0", className)} {...props}>
        {formatAnimatedCounterNumber(
          value,
          options,
          false, // counter === value ? showAbbreviatedNumber : false // TODO: Evaluate whether shrinking card based on content looks better.
        )}
      </span>
      <span
        className={cn("w-full absolute top-0 left-0", className)}
        {...props}
      >
        <Skeleton isLoading={!counter || !isSyncingAnimation}>
          <span>
            {formatAnimatedCounterNumber(
              counter ?? 0,
              options,
              showAbbreviatedNumber,
            )}
          </span>
        </Skeleton>
      </span>
    </div>
  );
};
