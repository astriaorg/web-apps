import {
  Card,
  CardContent,
  CardFigureLabel,
  CardLabel,
  CHART_INTERVAL_TO_CHART_TICK_INTERVAL,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  getDownsampledData,
  getTickIntervalData,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components";
import { ChartTooltipContent } from "earn/components/charts/chart-tooltip-content";
import { FloatDataPoint } from "earn/generated/gql/graphql";
import { ChartInterval } from "earn/modules/vault-details/types";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import {
  LineChart as BaseLineChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
} from "recharts";

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

  const downsampled = useMemo<FloatDataPoint[]>(() => {
    if (!data) {
      return [];
    }

    // Convert to milliseconds.
    return getDownsampledData(data).map((it) => ({ ...it, x: it.x * 1000 }));
  }, [data]);

  const ticks = useMemo(() => {
    if (!downsampled) {
      return [];
    }

    return getTickIntervalData(downsampled, {
      interval: CHART_INTERVAL_TO_CHART_TICK_INTERVAL[selectedInterval],
      key: "x",
    }).map((it) => (it as FloatDataPoint).x);
  }, [downsampled, selectedInterval]);

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

        <div className="mt-4" />
        <Skeleton isLoading={isLoading} className="w-full">
          <ChartContainer
            config={CHART_CONFIG}
            className="w-full h-52 min-h-52"
          >
            <BaseLineChart data={downsampled} height={208}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="x"
                tickLine={false}
                axisLine={false}
                ticks={ticks}
                dy={16}
                tickFormatter={(value) =>
                  formatDate(value, {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })
                }
              />
              <YAxis
                dataKey="y"
                hide
                // Make chart have some margin at the top and bottom.
                domain={[
                  (dataMin: number) => {
                    return dataMin * 0.1;
                  },
                  (dataMax: number) => {
                    return dataMax * 1.1;
                  },
                ]}
              />
              <ChartTooltip
                cursor={false}
                content={(content) => (
                  <ChartTooltipContent
                    {...content}
                    renderTooltipContent={renderTooltipContent}
                  />
                )}
              />
              <Line
                dataKey="y"
                stroke="var(--color-brand)"
                strokeWidth={1}
                dot={false}
                activeDot={{ r: 4.5 }}
              />
            </BaseLineChart>
          </ChartContainer>
        </Skeleton>
      </CardContent>
    </Card>
  );
};
