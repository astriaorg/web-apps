import {
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  tooltipVariants,
} from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import {
  SummaryCard,
  SummaryCardFigureText,
  SummaryCardLabel,
} from "earn/components/summary-card";
import { FloatDataPoint } from "earn/gql/graphql";
import { initializeLineChart } from "earn/modules/vault-details/components/charts/charts.utils";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
import {
  APY_CHART_INTERVALS,
  APYChartInterval,
} from "earn/modules/vault-details/types";
import { useEffect, useRef, useState } from "react";
import { FormattedNumber, useIntl } from "react-intl";

const CHART_HEIGHT = 52;

export const APYChart = () => {
  const {
    selectedAPYChartInterval,
    setSelectedAPYChartInterval,
    query: { isPending, data },
  } = usePageContext();
  const { formatDate, formatNumber } = useIntl();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [tooltipContent, setTooltipContent] = useState<{
    timestamp: number;
    apy: number;
  }>();

  useEffect(() => {
    let dailyAPYs = data?.vaultByAddress.historicalState.dailyApy;

    if (!dailyAPYs || !svgRef.current || !tooltipRef.current) {
      return;
    }

    initializeLineChart<FloatDataPoint>({
      data: dailyAPYs,
      height: CHART_HEIGHT * 4,
      svg: svgRef.current,
      tooltip: tooltipRef.current,
      onMouseOver: (value) => {
        setTooltipContent({
          timestamp: value.x,
          apy: value.y ?? 0,
        });
      },
    });
  }, [data]);

  return (
    <SummaryCard isLoading={isPending}>
      <SummaryCardLabel className="relative">
        <span>APY</span>
        <span className="absolute right-0">
          <Tabs
            defaultValue={selectedAPYChartInterval}
            onValueChange={(value) =>
              setSelectedAPYChartInterval(value as APYChartInterval)
            }
          >
            <TabsList>
              {APY_CHART_INTERVALS.map((it) => (
                <TabsTrigger key={it} value={it}>
                  {it}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </span>
      </SummaryCardLabel>
      <SummaryCardFigureText>
        <FormattedNumber
          value={data?.vaultByAddress.state?.apy ?? 0}
          style="percent"
          minimumFractionDigits={2}
        />
      </SummaryCardFigureText>

      <div className="mt-4" />
      <Skeleton isLoading={isPending} className="w-full">
        <svg ref={svgRef} className="earn-chart" />
        <div
          ref={tooltipRef}
          className={cn(
            tooltipVariants(),
            "absolute",
            tooltipContent ? "block" : "hidden",
          )}
        >
          <div className="flex flex-col">
            {tooltipContent && (
              <>
                <div>{formatDate(tooltipContent.timestamp * 1000)}</div>
                <div>
                  {formatNumber(tooltipContent.apy, {
                    style: "percent",
                    minimumFractionDigits: 2,
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </Skeleton>
    </SummaryCard>
  );
};
