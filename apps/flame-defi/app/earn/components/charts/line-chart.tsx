import {
  Button,
  Card,
  CardContent,
  CardFigureLabel,
  CardLabel,
  CHART_INTERVAL_TO_CHART_TICK_INTERVAL,
  ChartConfig,
  ChartContainer,
  ChartInterval,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  getSummarizedData,
  getTickIntervalData,
  getTickIntervalDateTimeFormatOptions,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components";
import { ChevronDownSmallIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import { Maybe } from "earn/generated/gql/graphql";
import { useCallback, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import {
  LineChart as BaseLineChart,
  CartesianGrid,
  Label,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// The height of the chart minus axis.
const CHART_HEIGHT = 169;

const CHART_CONFIG = {
  y: {},
} satisfies ChartConfig;

interface LineChartProps<
  DataType extends { x: number; y?: Maybe<number> },
  OptionType extends string,
> {
  data?: DataType[] | null;
  isError: boolean;
  isLoading: boolean;
  intervals: readonly ChartInterval[];
  selectedInterval: ChartInterval;
  setSelectedInterval: (value: ChartInterval) => void;
  options?: readonly OptionType[];
  selectedOption?: OptionType;
  setSelectedOption?: (value: OptionType) => void;
  renderSelectedOption?: (value: OptionType) => React.ReactNode;
  title: React.ReactNode;
  figure: React.ReactNode;
  renderAverageReferenceLineContent: (value: Pick<DataType, "y">) => string;
  renderTooltipContent: (value: DataType) => React.ReactNode;
}

export const LineChart = <
  DataType extends { x: number; y?: Maybe<number> },
  OptionType extends string,
>({
  data,
  isError,
  isLoading,
  intervals,
  selectedInterval,
  setSelectedInterval,
  options,
  selectedOption,
  setSelectedOption,
  renderSelectedOption,
  title,
  figure,
  renderAverageReferenceLineContent,
  renderTooltipContent,
}: LineChartProps<DataType, OptionType>) => {
  const { formatDate } = useIntl();

  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [tooltip, setTooltip] = useState<{
    x?: number;
    y?: number;
    data?: DataType;
    isOverRightBoundary: boolean;
  }>({ isOverRightBoundary: false });

  const interval = useMemo(
    () => CHART_INTERVAL_TO_CHART_TICK_INTERVAL[selectedInterval],
    [selectedInterval],
  );

  const { downsampled, ticks, dataMin, dataMax, dataAverage } = useMemo(() => {
    if (!data) {
      return {
        downsampled: [],
        ticks: [],
        dataMin: 0,
        dataMax: 0,
        dataAverage: 0,
      };
    }

    const { downsampled, min, max, average } = getSummarizedData(
      data as { x: number; y: number }[],
    );

    return {
      downsampled,
      ticks: getTickIntervalData(
        // Convert seconds to milliseconds.
        downsampled.map((it) => ({ ...it, x: it.x * 1000 })),
        interval,
        "x",
      ).map((it) => (it?.x ?? 0) / 1000),
      dataMin: Math.max(0, min * 0.1), // Make chart have some margin at the bottom.
      dataMax: max,
      dataAverage: average,
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

        const currentY: NonNullable<DataType["y"]> =
          e.activePayload?.[0]?.value ?? 0;
        // When data is all zero, handle division by zero.
        const range = dataMax - dataMin;
        tooltipY =
          range === 0 ? 48 : (1 - currentY / range) * CHART_HEIGHT - 28;

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
    [dataMin, dataMax],
  );

  if (isError || data === null) {
    return null;
  }

  return (
    <Card isLoading={isLoading}>
      <CardContent className="flex flex-col">
        <div className="relative flex flex-col gap-6 whitespace-nowrap">
          <div className="flex flex-col space-y-2">
            <CardLabel className="w-min flex flex-col items-start gap-2 md:flex-row md:justify-between">
              <span>{title}</span>
            </CardLabel>
            <CardFigureLabel className="w-min">{figure}</CardFigureLabel>
          </div>

          <Skeleton isLoading={isLoading} className="md:absolute">
            <div className="flex space-x-4 md:absolute md:right-0">
              {options?.length && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="secondary">
                      {renderSelectedOption?.(selectedOption as OptionType)}
                      <ChevronDownSmallIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-surface-3">
                    {options.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onSelect={() => {
                          setSelectedOption?.(option);
                        }}
                        className="focus:bg-surface-2"
                      >
                        {renderSelectedOption?.(option)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

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
            </div>
          </Skeleton>
        </div>

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
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="x"
                tickLine={false}
                ticks={ticks}
                dy={12}
                tickFormatter={(value: DataType["x"]) =>
                  formatDate(
                    value * 1000,
                    getTickIntervalDateTimeFormatOptions(interval),
                  )
                }
                // Show overflowing ticks.
                // allowDataOverflow
                // interval={0}
              />
              <YAxis dataKey="y" hide domain={[dataMin, dataMax]} />
              <ReferenceLine y={dataAverage} strokeDasharray="4 4">
                <Label
                  value={`Average ${renderAverageReferenceLineContent({ y: dataAverage })}`}
                  fill="var(--color-typography-light)"
                  position="insideTopLeft"
                  offset={10}
                  className="text-xs/3"
                />
              </ReferenceLine>
              <Line
                dataKey="y"
                stroke="var(--color-orange)"
                strokeWidth={1}
                dot={false}
                activeDot={{ r: 4.5 }}
              />
              <Tooltip
                position={{ x: tooltip.x, y: tooltip.y }}
                animationDuration={0}
                isAnimationActive={false}
                cursor={false}
                content={(content) => (
                  <div
                    ref={tooltipRef}
                    className={cn(
                      "text-brand text-sm text-center",
                      tooltip.isOverRightBoundary && "-translate-x-full",
                    )}
                  >
                    {content.payload?.[0]?.payload &&
                      renderTooltipContent(content.payload[0].payload)}
                  </div>
                )}
              />
            </BaseLineChart>
          </ChartContainer>
        </Skeleton>
      </CardContent>
    </Card>
  );
};
