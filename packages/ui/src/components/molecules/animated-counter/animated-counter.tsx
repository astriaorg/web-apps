"use client";

import { FormatNumberOptions, useIntl } from "@repo/libs/react-intl";
import { animate } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn, formatAbbreviatedNumber } from "../../../utils";
import { Skeleton } from "../../atoms";

interface AnimatedCounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  options?: FormatNumberOptions;
  useAbbreviatedNumberFormat?: boolean;
}

export const AnimatedCounter = ({
  value,
  options,
  useAbbreviatedNumberFormat,
  className,
  ...props
}: AnimatedCounterProps) => {
  const { formatNumber } = useIntl();

  const [hasStartedAnimating, setHasStartedAnimating] = useState(false);

  const counterRef = useRef<HTMLSpanElement>(null);

  const formatAnimatedCounterNumber = useCallback(
    (
      value: AnimatedCounterProps["value"],
      options: AnimatedCounterProps["options"],
      useAbbreviatedNumberFormat: AnimatedCounterProps["useAbbreviatedNumberFormat"],
    ) => {
      if (useAbbreviatedNumberFormat) {
        const { value: formattedValue, suffix: formattedValueSuffix } =
          formatAbbreviatedNumber(Math.round(value).toString(), options);

        return `${formattedValue}${formattedValueSuffix}`;
      }

      return formatNumber(value, options);
    },
    [formatNumber],
  );

  useEffect(() => {
    animate(0, value, {
      duration: 0.5,
      ease: [0, 1, 0, 1],
      onPlay: () => {
        setHasStartedAnimating(true);
      },
      onUpdate: (latest) => {
        if (counterRef.current) {
          counterRef.current.innerHTML = formatAnimatedCounterNumber(
            latest,
            options,
            useAbbreviatedNumberFormat,
          );
        }
      },
    });
  }, [value, formatAnimatedCounterNumber, options, useAbbreviatedNumberFormat]);

  return (
    // Show skeleton when the counter hasn't started animating.
    <Skeleton isLoading={!hasStartedAnimating}>
      <div className="relative">
        {/* Reserve space for the maximum value to prevent card size increasing with the animation. */}
        <span className={cn("opacity-0", className)} {...props}>
          {formatAnimatedCounterNumber(value, options, false)}
        </span>
        <span
          className={cn("w-full absolute top-0 left-0", className)}
          {...props}
        >
          <span ref={counterRef}></span>
        </span>
      </div>
    </Skeleton>
  );
};
