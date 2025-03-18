import { CHART_INTERVALS, Skeleton, StatusCard } from "@repo/ui/components";
import { useFormatAbbreviatedNumber } from "@repo/ui/hooks";
import { SortingState } from "@tanstack/react-table";
import Big from "big.js";
import { CHART_TYPE, LineChart } from "earn/components/charts";
import { SummaryCards, SummaryCardsProps } from "earn/components/summary-cards";
import { getPlaceholderData, VaultListTable } from "earn/components/vault";
import { Vault, VaultOrderBy } from "earn/generated/gql/graphql";
import { useFormatChartValue } from "earn/hooks/use-format-chart-value";
import { BorrowCards } from "earn/modules/market-details/components/borrow-cards";
import { OverviewCards } from "earn/modules/market-details/components/overview-cards";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";
import { useMemo, useState } from "react";

export const ContentSection = () => {
  const {
    charts,
    query: { data, isPending, status },
  } = usePageContext();
  const { formatAbbreviatedNumber } = useFormatAbbreviatedNumber();
  const { formatChartValue } = useFormatChartValue();

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: VaultOrderBy.TotalAssetsUsd,
      desc: true,
    },
  ]);

  const formattedData = useMemo(() => {
    if (isPending) {
      return getPlaceholderData(3);
    }

    return (data?.marketByUniqueKey.supplyingVaults ?? []) as Vault[];
  }, [data, isPending]);

  const items = useMemo<SummaryCardsProps["items"]>(() => {
    return [
      {
        label: {
          left: "Total Supply",
          right: data?.marketByUniqueKey.loanAsset.symbol,
        },
        footer: (() => {
          return formatAbbreviatedNumber(
            (data?.marketByUniqueKey.state?.supplyAssetsUsd ?? 0).toString(),
            {
              style: "currency",
              currency: "USD",
            },
          );
        })(),
        value: new Big(data?.marketByUniqueKey.state?.supplyAssets ?? 0)
          .div(10 ** (data?.marketByUniqueKey.loanAsset.decimals ?? 18))
          .toNumber(),
        options: {
          minimumFractionDigits: 2,
        },
        useAbbreviatedNumberFormat: true,
        variant: "accent",
      },
      {
        label: {
          left: "Liquidity",
          right: data?.marketByUniqueKey.loanAsset.symbol,
        },
        footer: (() => {
          return formatAbbreviatedNumber(
            (data?.marketByUniqueKey.state?.liquidityAssetsUsd ?? 0).toString(),
            {
              style: "currency",
              currency: "USD",
            },
          );
        })(),
        value: new Big(data?.marketByUniqueKey.state?.liquidityAssets ?? 0)
          .div(10 ** (data?.marketByUniqueKey.loanAsset.decimals ?? 18))
          .toNumber(),
        options: {
          minimumFractionDigits: 2,
        },
        useAbbreviatedNumberFormat: true,
      },
      {
        label: {
          left: "APY",
          right: data?.marketByUniqueKey.loanAsset.symbol,
        },
        value: data?.marketByUniqueKey.state?.netBorrowApy ?? 0,
        options: {
          style: "percent",
          minimumFractionDigits: 2,
        },
      },
    ];
  }, [data, formatAbbreviatedNumber]);

  const style = useMemo(() => {
    return undefined;
  }, []);

  return (
    <section className="flex flex-col px-4">
      {status === "error" && (
        <StatusCard>
          {`We couldn't fetch this market. Please try again later.`}
        </StatusCard>
      )}
      {status !== "error" && (
        <div className="mt-12 flex flex-col gap-10 lg:gap-2 lg:flex-row">
          {/* Summary section. */}
          <div className="order-2 lg:order-1 lg:basis-2/3">
            <SummaryCards
              items={items}
              isLoading={isPending}
              className="grid gap-2 md:grid-cols-3"
            />

            <div className="mt-10 flex flex-col space-y-4">
              <Skeleton isLoading={isPending} className="w-52">
                <div className="text-base/4 font-semibold">Overview</div>
              </Skeleton>
              <OverviewCards />

              <LineChart
                data={
                  charts[CHART_TYPE.TOTAL_ASSETS].query.data?.marketByUniqueKey
                    .historicalState?.borrowAssets
                }
                isError={charts[CHART_TYPE.TOTAL_ASSETS].query.isError}
                isLoading={
                  isPending || charts[CHART_TYPE.TOTAL_ASSETS].query.isPending
                }
                intervals={CHART_INTERVALS}
                selectedInterval={
                  charts[CHART_TYPE.TOTAL_ASSETS].selectedInterval
                }
                setSelectedInterval={
                  charts[CHART_TYPE.TOTAL_ASSETS].setSelectedInterval
                }
                title={`Total Assets`}
                figure={formatChartValue(
                  {
                    y: new Big(data?.marketByUniqueKey.state?.supplyAssets ?? 0)
                      .div(
                        10 **
                          (data?.marketByUniqueKey.collateralAsset?.decimals ??
                            18),
                      )
                      .toFixed(),
                  },
                  { style },
                )}
                renderLabelContent={(value) =>
                  formatChartValue(value, { style })
                }
                renderTooltipContent={(value) =>
                  formatChartValue(value, { style })
                }
              />
              <LineChart
                data={
                  charts[CHART_TYPE.APY].query.data?.marketByUniqueKey
                    .historicalState?.dailyBorrowApy
                }
                isError={charts[CHART_TYPE.APY].query.isError}
                isLoading={isPending || charts[CHART_TYPE.APY].query.isPending}
                intervals={CHART_INTERVALS}
                selectedInterval={charts[CHART_TYPE.APY].selectedInterval}
                setSelectedInterval={charts[CHART_TYPE.APY].setSelectedInterval}
                title="APY"
                figure={formatChartValue(
                  {
                    y: data?.marketByUniqueKey.state?.netBorrowApy ?? 0,
                  },
                  { style: "percent" },
                )}
                renderLabelContent={(value) =>
                  formatChartValue(value, { style: "percent" })
                }
                renderTooltipContent={(value) =>
                  formatChartValue(value, { style: "percent" })
                }
              />

              <VaultListTable
                data={formattedData}
                sorting={sorting}
                onSortingChange={setSorting}
                getHeaderIsActive={(header) => header.id === sorting[0]?.id}
                getHeaderIsAscending={(header) =>
                  header.column.getNextSortingOrder() === "desc"
                }
                isLoading={isPending}
              />
            </div>
          </div>

          {/* Borrow section. */}
          <div className="order-1 lg:order-2 lg:basis-1/3 overflow-hidden">
            <BorrowCards />
          </div>
        </div>
      )}
    </section>
  );
};
