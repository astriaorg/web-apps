import { AnimatedCounter, Card, Skeleton } from "@repo/ui/components";
import { usePageContext } from "earn/modules/vault-list/hooks/use-page-context";
import { useMemo } from "react";

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
        right?: React.ReactNode;
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
        <Card
          key={`market-summary_card_${index}`}
          padding="md"
          className="space-y-2"
        >
          <span className="text-xs/3 text-text-light">{it.label.left}</span>

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
        </Card>
      ))}
    </div>
  );
};
