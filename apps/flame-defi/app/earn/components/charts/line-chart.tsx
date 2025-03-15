import {
  Card,
  CardContent,
  CardFigureLabel,
  CardLabel,
  CHART_INTERVAL_TO_CHART_TICK_INTERVAL,
  ChartConfig,
  ChartContainer,
  getDownsampledData,
  getTickIntervalData,
  getTickIntervalDateTimeFormatOptions,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { ChartTooltip } from "earn/components/charts/chart-tooltip";
import { FloatDataPoint } from "earn/generated/gql/graphql";
import { ChartInterval } from "earn/modules/vault-details/types";
import { useCallback, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import {
  LineChart as BaseLineChart,
  CartesianGrid,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// The height of the chart minus axis.
const CHART_HEIGHT = 169;

const CHART_CONFIG = {
  y: {},
} satisfies ChartConfig;

interface LineChartProps {
  data?: FloatDataPoint[] | null;
  isError: boolean;
  isLoading: boolean;
  intervals: readonly ChartInterval[];
  selectedInterval: ChartInterval;
  setSelectedInterval: (value: ChartInterval) => void;
  title: React.ReactNode;
  figure: React.ReactNode;
  renderTooltipContent: (value: FloatDataPoint) => React.ReactNode;
}

export const LineChart = ({
  data,
  isError,
  isLoading,
  intervals,
  selectedInterval,
  setSelectedInterval,
  title,
  figure,
  renderTooltipContent,
}: LineChartProps) => {
  const { formatDate } = useIntl();

  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [tooltip, setTooltip] = useState<{
    x: number | null;
    y: number | null;
    data?: FloatDataPoint;
    isOverRightBoundary: boolean;
  }>({ x: null, y: null, isOverRightBoundary: false });

  const interval = useMemo(
    () => CHART_INTERVAL_TO_CHART_TICK_INTERVAL[selectedInterval],
    [selectedInterval],
  );

  const { downsampled, ticks, dataMax } = useMemo(() => {
    if (!data) {
      return { downsampled: [], ticks: [], dataMin: 0, dataMax: 0 };
    }

    const downsampled = getDownsampledData(data);

    const domain = downsampled.map((it) => it.y ?? 0);

    return {
      downsampled,
      ticks: getTickIntervalData<FloatDataPoint>(
        // Convert seconds to milliseconds.
        downsampled.map((it) => ({ ...it, x: it.x * 1000 })),
        interval,
        "x",
      ).map((it) => (it?.x ?? 0) / 1000),
      dataMin: Math.min(...domain),
      dataMax: Math.max(...domain),
    };
  }, [data, interval]);

  const handleOnMouseMove = useCallback(
    (
      e: Parameters<
        NonNullable<
          React.ComponentPropsWithoutRef<typeof BaseLineChart>["onMouseMove"]
        >
      >[0],
    ) => {
      if (!!chartRef.current && !!tooltipRef.current && e.chartX && e.chartY) {
        let tooltipX: number | null = null;
        let tooltipY: number | null = null;

        const chartRect = chartRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        const rightBoundary = Math.ceil(chartRect.right - chartRect.left);

        if (e.chartX + tooltipRect.width >= rightBoundary) {
          tooltipX = rightBoundary - tooltipRect.width;
        } else if (e.chartX - tooltipRect.width / 2 <= 0) {
          tooltipX = 0;
        } else {
          tooltipX = e.chartX - tooltipRect.width / 2;
        }

        const currentY: NonNullable<FloatDataPoint["y"]> =
          e.activePayload?.[0]?.value ?? 0;
        tooltipY = (1 - currentY / dataMax) * CHART_HEIGHT - 32;

        setTooltip({
          x: tooltipX,
          y: tooltipY,
          data: e.activePayload?.[0].payload,
          // Handle edge case when tooltip width is 0 and rendered incorrectly on the right boundary.
          // Setting style via tooltipRef.current.style... doesn't work.
          isOverRightBoundary:
            tooltipRef.current?.clientWidth === 0 &&
            e.chartX + 10 >= rightBoundary,
        });
      }
    },
    [dataMax],
  );

  if (isError || data === null) {
    return null;
  }

  return (
    <Card isLoading={isLoading}>
      <CardContent className="space-y-2">
        <CardLabel className="relative">
          <span>{title}</span>
          <span className="absolute right-0">
            <Tabs
              defaultValue={selectedInterval}
              onValueChange={(value) => {
                setSelectedInterval(value as ChartInterval);
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
        </CardLabel>
        <CardFigureLabel>{figure}</CardFigureLabel>

        <div className="mt-10" />
        <Skeleton isLoading={isLoading} className="w-full">
          <ChartContainer
            ref={chartRef}
            config={CHART_CONFIG}
            className="w-full h-52 min-h-52"
          >
            <BaseLineChart
              data={downsampled}
              height={208}
              onMouseMove={handleOnMouseMove}
              onMouseLeave={() =>
                setTooltip({ x: null, y: null, isOverRightBoundary: false })
              }
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="x"
                tickLine={false}
                ticks={ticks}
                dy={16}
                tickFormatter={(value: FloatDataPoint["x"]) =>
                  formatDate(
                    value * 1000,
                    getTickIntervalDateTimeFormatOptions(interval),
                  )
                }
                // Show overflowing ticks.
                // allowDataOverflow
                // interval={0}
              />
              <YAxis dataKey="y" hide domain={[0, dataMax]} />
              <Line
                dataKey="y"
                stroke="var(--color-brand)"
                strokeWidth={1}
                dot={false}
                activeDot={{ r: 4.5 }}
              />
              <Tooltip
                position={{ x: tooltip.x ?? 0, y: tooltip.y ?? 0 }}
                animationDuration={0}
                isAnimationActive={false}
                cursor={false}
                content={(content) => (
                  <ChartTooltip
                    ref={tooltipRef}
                    className={cn(
                      tooltip.isOverRightBoundary && "-translate-x-full",
                    )}
                  >
                    {content.payload?.[0]?.payload &&
                      renderTooltipContent(content.payload[0].payload)}
                  </ChartTooltip>
                )}
              />
            </BaseLineChart>
          </ChartContainer>
        </Skeleton>
      </CardContent>
    </Card>
  );
};
