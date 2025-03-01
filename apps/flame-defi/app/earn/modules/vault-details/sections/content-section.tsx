import { Skeleton, StatusCard } from "@repo/ui/components";
import { FormattedNumber, useIntl } from "@repo/ui/intl";
import { formatAbbreviatedNumber } from "@repo/ui/utils";
import { LineChart } from "earn/modules/vault-details/components/charts";
import { DepositCards } from "earn/modules/vault-details/components/deposit-cards";
import { SummaryCards } from "earn/modules/vault-details/components/summary-cards";
import { Table } from "earn/modules/vault-details/components/table";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
import { CHART_INTERVALS, CHART_TYPE } from "earn/modules/vault-details/types";

export const ContentSection = () => {
  const { formatDate, formatNumber } = useIntl();
  const {
    charts,
    query: { data, isPending, status },
  } = usePageContext();

  const { value: formattedTotalSupply, suffix: formattedTotalSupplySuffix } =
    formatAbbreviatedNumber(
      (data?.vaultByAddress.state?.totalAssetsUsd ?? 0).toString(),
    );

  return (
    <section className="flex flex-col px-4 md:px-20">
      {status === "error" && (
        <StatusCard>
          {`We couldn't fetch this vault. Please try again later.`}
        </StatusCard>
      )}
      {status !== "error" && (
        <div className="mt-12 flex flex-col gap-10 lg:gap-2 lg:flex-row">
          {/* Summary section. */}
          <div className="order-2 lg:order-1 lg:basis-2/3">
            <SummaryCards />
            <div className="mt-10 flex flex-col space-y-4">
              <Skeleton isLoading={isPending}>
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
                figure={
                  <FormattedNumber
                    value={data?.vaultByAddress.state?.netApy ?? 0}
                    style="percent"
                    minimumFractionDigits={2}
                  />
                }
                renderTooltip={(value) => (
                  <>
                    <div>{formatDate(value.x * 1000)}</div>
                    <div>
                      {formatNumber(value.y ?? 0, {
                        style: "percent",
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </>
                )}
              />
              <LineChart
                data={
                  charts[CHART_TYPE.TOTAL_SUPPLY].query.data?.vaultByAddress
                    .historicalState.totalAssetsUsd
                }
                isError={charts[CHART_TYPE.TOTAL_SUPPLY].query.isError}
                isLoading={
                  isPending || charts[CHART_TYPE.TOTAL_SUPPLY].query.isPending
                }
                intervals={CHART_INTERVALS}
                selectedInterval={
                  charts[CHART_TYPE.TOTAL_SUPPLY].selectedInterval
                }
                setSelectedInterval={
                  charts[CHART_TYPE.TOTAL_SUPPLY].setSelectedInterval
                }
                title="Total Supply"
                figure={
                  formatNumber(+formattedTotalSupply, {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                  }) + formattedTotalSupplySuffix
                }
                renderTooltip={(value) => {
                  const { value: totalSupply, suffix } =
                    formatAbbreviatedNumber((value.y ?? 0).toString());

                  return (
                    <>
                      <div>{formatDate(value.x * 1000)}</div>
                      <div>
                        {formatNumber(+totalSupply, {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 2,
                        })}
                        {suffix}
                      </div>
                    </>
                  );
                }}
              />

              <Table />
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
