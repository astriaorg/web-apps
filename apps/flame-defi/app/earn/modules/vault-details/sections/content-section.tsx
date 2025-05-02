import { SortingState } from "@tanstack/react-table";
import Big from "big.js";
import { useCallback, useMemo, useState } from "react";

import { CHART_INTERVALS, Skeleton, StatusCard } from "@repo/ui/components";
import { useFormatAbbreviatedNumber } from "@repo/ui/hooks";
import { CHART_TYPE, LineChart } from "earn/components/charts";
import { getPlaceholderData, MarketListTable } from "earn/components/market";
import { SummaryCards, SummaryCardsProps } from "earn/components/summary-cards";
import {
  BigIntDataPoint,
  FloatDataPoint,
  Market,
  MarketOrderBy,
} from "earn/generated/gql/graphql";
import { useFormatChartValue } from "earn/hooks/use-format-chart-value";
import { DepositCards } from "earn/modules/vault-details/components/deposit-cards";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
import {
  TOTAL_ASSETS_OPTION,
  TOTAL_ASSETS_OPTIONS,
  TotalAssetsOption,
} from "earn/modules/vault-details/types";

export const ContentSection = () => {
  const {
    charts,
    query: { data, isPending, status },
  } = usePageContext();
  const { formatAbbreviatedNumber } = useFormatAbbreviatedNumber();
  const { formatChartValue } = useFormatChartValue();

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: MarketOrderBy.TotalLiquidityUsd,
      desc: true,
    },
  ]);

  const formattedData = useMemo(() => {
    if (isPending) {
      return getPlaceholderData(3);
    }

    return (data?.vaultByAddress.state?.allocation?.map((it) => it.market) ??
      []) as Market[];
  }, [data, isPending]);

  const items = useMemo<SummaryCardsProps["items"]>(() => {
    return [
      {
        label: { left: "APY" },
        value: data?.vaultByAddress.state?.netApy ?? 0,
        variant: "accent",
        options: {
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      },
      {
        label: {
          left: "Total Deposits",
          right: data?.vaultByAddress.asset.symbol,
        },
        footer: (() => {
          return formatAbbreviatedNumber(
            (data?.vaultByAddress.state?.totalAssetsUsd ?? 0).toString(),
            {
              style: "currency",
              currency: "USD",
            },
          );
        })(),
        value: new Big(data?.vaultByAddress.state?.totalAssets ?? 0)
          .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
          .toNumber(),
        options: {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        },
        useAbbreviatedNumberFormat: true,
      },
      {
        label: {
          left: "Liquidity",
          right: data?.vaultByAddress.asset.symbol,
        },
        footer: (() => {
          return formatAbbreviatedNumber(
            (data?.vaultByAddress.liquidity?.usd ?? 0).toString(),
            {
              style: "currency",
              currency: "USD",
            },
          );
        })(),
        value: new Big(data?.vaultByAddress.liquidity?.underlying ?? 0)
          .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
          .toNumber(),
        options: {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        },
        useAbbreviatedNumberFormat: true,
      },
    ];
  }, [data, formatAbbreviatedNumber]);

  const {
    data: totalAssetsData,
    title,
    figure,
    style,
  } = useMemo<{
    data?: (BigIntDataPoint | FloatDataPoint)[] | null;
    title: string;
    figure: React.ReactNode;
    style?: string;
  }>(() => {
    if (
      charts[CHART_TYPE.TOTAL_ASSETS].selectedOption ===
      TOTAL_ASSETS_OPTION.FIAT
    ) {
      return {
        data: charts[CHART_TYPE.TOTAL_ASSETS].query.data?.vaultByAddress
          .historicalState.totalAssetsUsd,
        title: `Total Deposits (USD)`,
        figure: data?.vaultByAddress.state?.totalAssetsUsd,
        style: "currency",
      };
    }

    if (
      charts[CHART_TYPE.TOTAL_ASSETS].selectedOption ===
      TOTAL_ASSETS_OPTION.ASSET
    ) {
      return {
        data: charts[CHART_TYPE.TOTAL_ASSETS].query.data?.vaultByAddress
          .historicalState.totalAssets,
        title: `Total Deposits (${data?.vaultByAddress.asset.symbol})`,
        figure: new Big(data?.vaultByAddress.state?.totalAssets ?? 0)
          .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
          .toFixed(),
      };
    }

    throw new Error(
      `Invalid chart selected option "${charts[CHART_TYPE.TOTAL_ASSETS].selectedOption}".`,
    );
  }, [charts, data]);

  const renderSelectedOption = useCallback(
    (value: TotalAssetsOption) => {
      if (value === TOTAL_ASSETS_OPTION.ASSET) {
        return data?.vaultByAddress.asset.symbol;
      }

      if (value === TOTAL_ASSETS_OPTION.FIAT) {
        return "USD";
      }
    },
    [data?.vaultByAddress.asset.symbol],
  );

  return (
    <section className="flex flex-col px-4">
      {status === "error" && (
        <StatusCard>
          {`We couldn't fetch this vault. Please try again later.`}
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

              <LineChart
                data={
                  charts[CHART_TYPE.APY].query.data?.vaultByAddress
                    .historicalState.dailyApy
                }
                isError={charts[CHART_TYPE.APY].query.isError}
                isLoading={isPending || charts[CHART_TYPE.APY].query.isPending}
                intervals={CHART_INTERVALS}
                selectedInterval={charts[CHART_TYPE.APY].selectedInterval}
                setSelectedInterval={charts[CHART_TYPE.APY].setSelectedInterval}
                title="APY"
                figure={formatChartValue(
                  {
                    y: data?.vaultByAddress.state?.netApy ?? 0,
                  },
                  { style: "percent" },
                )}
                renderAverageReferenceLineContent={(value) =>
                  formatChartValue(value, { style: "percent" })
                }
                renderTooltipContent={(value) =>
                  formatChartValue(value, { style: "percent" })
                }
              />
              <LineChart<BigIntDataPoint | FloatDataPoint, TotalAssetsOption>
                data={totalAssetsData}
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
                options={TOTAL_ASSETS_OPTIONS}
                selectedOption={
                  charts[CHART_TYPE.TOTAL_ASSETS]
                    .selectedOption as TotalAssetsOption
                }
                setSelectedOption={
                  charts[CHART_TYPE.TOTAL_ASSETS].setSelectedOption
                }
                renderSelectedOption={renderSelectedOption}
                title={title}
                figure={formatChartValue(
                  {
                    y: figure,
                  },
                  { style },
                )}
                renderAverageReferenceLineContent={(value) =>
                  formatChartValue(value, { style })
                }
                renderTooltipContent={(value) =>
                  formatChartValue(value, { style })
                }
              />

              <MarketListTable
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

          {/* Deposit section. */}
          <div className="order-1 lg:order-2 lg:basis-1/3 overflow-hidden">
            <DepositCards />
          </div>
        </div>
      )}
    </section>
  );
};
