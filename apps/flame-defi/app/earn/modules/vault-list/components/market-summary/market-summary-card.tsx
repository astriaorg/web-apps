import { Skeleton } from "@repo/ui/shadcn-primitives";
import Big from "big.js";
import { Card } from "earn/components/card";
import React, { useEffect } from "react";
import { FormattedNumber } from "react-intl";

interface MarketSummaryCardProps {
  label: React.ReactNode;
  value: number;
  count: number | null;
  setCount: (value: number) => void;
  /**
   * Sync animation state between multiple cards.
   */
  isAnimating: boolean;
}

export const MarketSummaryCard = ({
  label,
  value,
  count,
  setCount,
  isAnimating,
}: MarketSummaryCardProps) => {
  useEffect(() => {
    let isMounted = true;

    const counter = (minimum: number, maximum: number) => {
      let i = minimum;

      const updateCount = () => {
        if (isMounted && i <= maximum) {
          setCount(i);

          // Increment counter based on proximity to maximum so multiple cards have synced animations.
          const range = maximum - minimum;
          const progress = (i - minimum) / range;
          const step = Math.max(1, (Math.log10(1 + 9 * progress) * range) / 10);

          i += Math.ceil(step);

          setTimeout(updateCount, 10);
        }

        if (isMounted && i > maximum) {
          setCount(maximum);
        }
      };

      updateCount();

      return () => {
        isMounted = false;
      };
    };

    counter(0, value);

    return () => {
      isMounted = false;
    };
  }, [value, setCount]);

  return (
    <Card className="flex flex-col rounded-xl p-5 space-y-1">
      <span className="text-xs/3 text-text-light">{label}</span>

      <div className="relative">
        {/* Reserve space for animation to prevent card size increasing with counter value. */}
        <span className="text-3xl/8 font-dot opacity-0">
          <FormattedNumber
            value={+new Big(value).toFixed()}
            style="currency"
            currency="USD"
            maximumFractionDigits={0}
          />
        </span>
        <span className="text-3xl/8 font-dot w-full absolute top-0 left-0">
          <Skeleton isLoading={!count || !isAnimating}>
            <span>
              <FormattedNumber
                value={+new Big(count ?? 0).toFixed()}
                style="currency"
                currency="USD"
                maximumFractionDigits={0}
              />
            </span>
          </Skeleton>
        </span>
      </div>
    </Card>
  );
};
