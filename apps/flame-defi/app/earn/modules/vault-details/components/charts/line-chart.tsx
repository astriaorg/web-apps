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

const CHART_HEIGHT = 52;

interface LineChartProps {
  data?: FloatDataPoint[] | null;
  isLoading: boolean;
  intervals: ChartInterval[];
  selectedInterval: ChartInterval;
  setSelectedInterval: (value: ChartInterval) => void;
  title: React.ReactNode;
  figure: React.ReactNode;
  renderTooltip: (value: FloatDataPoint) => React.ReactNode;
}

export const LineChart = ({
  data,
  isLoading,
  intervals,
  selectedInterval,
  setSelectedInterval,
  title,
  figure,
  renderTooltip,
}: LineChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const [tooltipContent, setTooltipContent] = useState<FloatDataPoint | null>(
    null,
  );

  useEffect(() => {
    if (!data || !svgRef.current || !tooltipRef.current) {
      return;
    }

    initializeLineChart<FloatDataPoint>({
      data,
      height: CHART_HEIGHT * 4,
      svg: svgRef.current,
      tooltip: tooltipRef.current,
      interval: selectedInterval,
      onMouseOver: (value) => {
        setTooltipContent(value);
      },
    });
  }, [data, selectedInterval]);

  return (
    <SummaryCard isLoading={isLoading}>
      <SummaryCardLabel className="relative">
        <span>{title}</span>
        <span className="absolute right-0">
          <Tabs
            defaultValue={selectedInterval}
            onValueChange={(value) => {
              setSelectedInterval(value as ChartInterval);
              setTooltipContent(null);
            }}
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
        <div className="relative">
          <svg ref={svgRef} className="earn-chart h-52" />
          <div
            ref={tooltipRef}
            className={cn(
              tooltipVariants(),
              "absolute",
              !!tooltipContent ? "block" : "hidden",
            )}
          >
            <div className="flex flex-col">
              {!!tooltipContent && renderTooltip(tooltipContent)}
            </div>
          </div>
        </div>
      </Skeleton>
    </SummaryCard>
  );
};
