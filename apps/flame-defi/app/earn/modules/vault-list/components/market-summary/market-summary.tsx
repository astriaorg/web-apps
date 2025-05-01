import { usePageContext } from "earn/modules/vault-list/hooks/use-page-context";
import { useMemo } from "react";

import {
  AnimatedCounter,
  Card,
  CardContent,
  CardLabel,
  Skeleton,
} from "@repo/ui/components";

// TODO: Use fetched values, handle error state.
const VALUE_DEPOSIT = 1000000;
const VALUE_BORROW = 75000;

export const MarketSummary = () => {
  const {
    query: { isPending },
  } = usePageContext();

  const items = useMemo<
    {
      label: {
        left: React.ReactNode;
      };
      value: number;
    }[]
  >(() => {
    return [
      {
        label: {
          left: "Total Deposits",
        },
        value: VALUE_DEPOSIT,
      },
      {
        label: {
          left: "Total Borrow",
        },
        value: VALUE_BORROW,
      },
    ];
  }, []);

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {items.map((it, index) => (
        <Card key={`market-summary_card_${index}`}>
          <CardContent className="space-y-2">
            <CardLabel>
              <span>{it.label.left}</span>
            </CardLabel>

            <Skeleton isLoading={isPending}>
              <AnimatedCounter
                value={it.value}
                className="text-3xl/8 font-dot"
                options={{
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }}
                useAbbreviatedNumberFormat
              />
            </Skeleton>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
