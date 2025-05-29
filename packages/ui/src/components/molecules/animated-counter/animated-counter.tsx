"use client";

import { animate } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormatNumberOptions, useIntl } from "react-intl";

import { useFormatAbbreviatedNumber } from "../../../hooks";
import { cn } from "../../../utils";
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
  const { formatAbbreviatedNumber } = useFormatAbbreviatedNumber();

  const [hasStartedAnimating, setHasStartedAnimating] = useState(false);

  const counterRef = useRef<HTMLSpanElement>(null);

  const formatAnimatedCounterNumber = useCallback(
    (
      value: AnimatedCounterProps["value"],
      options: AnimatedCounterProps["options"],
      useAbbreviatedNumberFormat: AnimatedCounterProps["useAbbreviatedNumberFormat"],
    ) => {
      if (useAbbreviatedNumberFormat) {
        return formatAbbreviatedNumber(Math.round(value).toString(), options);
      }

      return formatNumber(value, options);
    },
    [formatNumber, formatAbbreviatedNumber],
  );

  useEffect(() => {
    let isMounted = true;

    if (value <= 0) {
      if (isMounted) {
        setHasStartedAnimating(true);
      }

      if (counterRef.current) {
        counterRef.current.innerHTML = formatAnimatedCounterNumber(
          0,
          options,
          useAbbreviatedNumberFormat,
        );
      }

      return;
    }

    animate(0, value, {
      duration: 0.5,
      ease: [0, 1, 0, 1],
      onPlay: () => {
        if (isMounted) {
          setHasStartedAnimating(true);
        }
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

    return () => {
      isMounted = false;
    };
  }, [value, formatAnimatedCounterNumber, options, useAbbreviatedNumberFormat]);

  return (
    // Show skeleton when the counter hasn't started animating.
    <Skeleton isLoading={!hasStartedAnimating}>
      <div className="relative overflow-hidden">
        {/* Reserve space for the maximum value to prevent card size increasing with the animation. */}
        <span className={cn("opacity-0", className)} {...props}>
          {formatAnimatedCounterNumber(value, options, false)}
        </span>
        <span
          ref={counterRef}
          className={cn("w-full absolute top-0 left-0", className)}
          {...props}
        ></span>
      </div>
    </Skeleton>
  );
};
