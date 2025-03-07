import { Card, CardLabel } from "@repo/ui/components";
import { FormattedDate } from "@repo/ui/intl";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";
import { useMemo } from "react";

export const OverviewCards = () => {
  const {
    query: { data, isPending },
  } = usePageContext();

  const items = useMemo<
    {
      label: {
        left: React.ReactNode;
      };
      value: React.ReactNode;
    }[]
  >(() => {
    return [
      {
        label: {
          left: "Collateral Token",
        },
        value: data?.marketByUniqueKey.collateralAsset?.symbol,
      },
      {
        label: {
          left: "Loan Token",
        },
        value: data?.marketByUniqueKey.loanAsset.symbol,
      },
      {
        label: {
          left: "Date Created",
        },
        value: (
          <FormattedDate
            value={data?.marketByUniqueKey.creationTimestamp * 1000}
            year="numeric"
            month="long"
            day="numeric"
          />
        ),
      },
    ];
  }, [data]);

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((it, index) => (
        <Card
          key={`overview-cards_item_${index}`}
          isLoading={isPending}
          padding="md"
          className="space-y-2"
        >
          <CardLabel>
            <span className="truncate text-lg text-typography-default">
              {it.value}
            </span>
          </CardLabel>
          <CardLabel>
            <span className="truncate">{it.label.left}</span>
          </CardLabel>
        </Card>
      ))}
    </div>
  );
};
