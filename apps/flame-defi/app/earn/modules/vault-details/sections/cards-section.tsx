import { Skeleton } from "@repo/ui/components";
import { LineChart } from "earn/modules/vault-details/components/charts";
import { SummaryCards } from "earn/modules/vault-details/components/summary-cards";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
import { APY_CHART_INTERVALS } from "earn/modules/vault-details/types";
import { FormattedNumber } from "react-intl";

export const CardsSection = () => {
  const {
    selectedAPYChartInterval,
    setSelectedAPYChartInterval,
    query: { data, isPending },
  } = usePageContext();

  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="mt-12">
        <SummaryCards />
        <div className="mt-10 flex flex-col space-y-4">
          <Skeleton isLoading={isPending}>
            <div className="text-base/4 font-semibold">Overview</div>
          </Skeleton>
          <LineChart
            data={data?.vaultByAddress.historicalState.dailyApy ?? []}
            isLoading={isPending}
            intervals={APY_CHART_INTERVALS}
            selectedInterval={selectedAPYChartInterval}
            setSelectedInterval={setSelectedAPYChartInterval}
            title="APY"
            figure={
              <FormattedNumber
                value={data?.vaultByAddress.state?.apy ?? 0}
                style="percent"
                minimumFractionDigits={2}
              />
            }
          />
        </div>
      </div>
    </section>
  );
};
