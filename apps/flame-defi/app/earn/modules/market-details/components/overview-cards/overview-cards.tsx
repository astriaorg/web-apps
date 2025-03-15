import { Card, CardContent, CardLabel } from "@repo/ui/components";
import Big from "big.js";
import { Asset } from "earn/generated/gql/graphql";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";
import { useMemo } from "react";
import { FormattedDate, useIntl } from "react-intl";
import { AssetRow } from "./asset-row";

export const OverviewCards = () => {
  const { formatNumber } = useIntl();
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
        value: (
          <AssetRow asset={data?.marketByUniqueKey.collateralAsset as Asset} />
        ),
      },
      {
        label: {
          left: "Loan Token",
        },
        value: <AssetRow asset={data?.marketByUniqueKey.loanAsset as Asset} />,
      },
      {
        label: {
          left: "LLTV",
        },
        value: (
          <span className="truncate">
            {formatNumber(
              new Big(data?.marketByUniqueKey.lltv ?? 0)
                .div(10 ** 18)
                .toNumber(),
              { style: "percent", minimumFractionDigits: 2 },
            )}
          </span>
        ),
      },
      {
        label: {
          left: "Date Created",
        },
        value: (
          <span className="truncate">
            <FormattedDate
              value={data?.marketByUniqueKey.creationTimestamp * 1000}
              year="numeric"
              month="long"
              day="numeric"
            />
          </span>
        ),
      },
    ];
  }, [data, formatNumber]);

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((it, index) => (
        <Card key={`overview-cards_item_${index}`} isLoading={isPending}>
          <CardContent className="space-y-2">
            <CardLabel>
              <span className="truncate">{it.label.left}</span>
            </CardLabel>
            <CardLabel className="text-lg text-typography-default">
              {it.value}
            </CardLabel>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
