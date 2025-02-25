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
import { ChartInterval } from "earn/modules/vault-details/types";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

const CHART_HEIGHT = 52;

interface LineChartProps {
  data: FloatDataPoint[];
  isLoading: boolean;
  intervals: ChartInterval[];
  selectedInterval: ChartInterval;
  setSelectedInterval: (value: ChartInterval) => void;
  title: React.ReactNode;
  figure: React.ReactNode;
}

export const LineChart = ({
  data,
  isLoading,
  intervals,
  selectedInterval,
  setSelectedInterval,
  title,
  figure,
}: LineChartProps) => {
  const { formatDate, formatNumber } = useIntl();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [tooltipContent, setTooltipContent] = useState<{
    timestamp: number;
    apy: number;
  }>();

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) {
      return;
    }

    initializeLineChart<FloatDataPoint>({
      data,
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
    <SummaryCard isLoading={isLoading}>
      <SummaryCardLabel className="relative">
        <span>{title}</span>
        <span className="absolute right-0">
          <Tabs
            defaultValue={selectedInterval}
            onValueChange={(value) =>
              setSelectedInterval(value as ChartInterval)
            }
          >
            <TabsList>
              {intervals.map((it) => (
                <TabsTrigger key={it} value={it}>
                  {it}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </span>
      </SummaryCardLabel>
      <SummaryCardFigureText>{figure}</SummaryCardFigureText>

      <div className="mt-4" />
      <Skeleton isLoading={isLoading} className="w-full">
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
