import { Skeleton } from "@repo/ui/shadcn-primitives";
import Big from "big.js";
import React, { useEffect, useState } from "react";
import { FormattedNumber } from "react-intl";
import { Card } from "../Card";

interface MarketSummaryCardProps {
  label: React.ReactNode;
  value: number;
}

export const MarketSummaryCard = ({ label, value }: MarketSummaryCardProps) => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const counter = (minimum: number, maximum: number) => {
      for (let count = minimum; count <= maximum; count++) {
        setTimeout(() => {
          if (isMounted) {
            setCount(count);
          }
        }, 5000);
      }
    };

    const minimum = value - 10000;
    counter(minimum < 0 ? 0 : minimum, value);

    return () => {
      isMounted = false;
    };
  }, [value]);

  return (
    <Card className="flex flex-col rounded-xl p-5 space-y-1">
      <span className="text-xs/3 text-grey-light">{label}</span>

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
          <Skeleton isLoading={count === null}>
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
