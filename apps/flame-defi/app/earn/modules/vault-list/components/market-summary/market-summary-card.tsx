import { Card, Skeleton } from "@repo/ui/components";
import { useAnimateCounter } from "@repo/ui/hooks";
import { FormattedNumber } from "@repo/ui/intl";
import Big from "big.js";
import React from "react";

interface MarketSummaryCardProps {
  label: React.ReactNode;
  value: number;
  count: number | null;
  setCounter: (value: number) => void;
  /**
   * Sync animation state between multiple cards.
   */
  isAnimating: boolean;
}

export const MarketSummaryCard = ({
  label,
  value,
  count,
  setCounter,
  isAnimating,
}: MarketSummaryCardProps) => {
  useAnimateCounter({ value, setCounter });

  return (
    <Card padding="md">
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
