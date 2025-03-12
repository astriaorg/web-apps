import {
  Card,
  CardContent,
  CardFigureLabel,
  CardLabel,
  CHART_INTERVAL_TO_CHART_TICK_INTERVAL,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  getDownsampledData,
  getTickIntervalData,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components";
import { FloatDataPoint } from "earn/generated/gql/graphql";
import { ChartInterval } from "earn/modules/vault-details/types";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import {
  LineChart as BaseLineChart,
  CartesianGrid,
  Line,
  XAxis,
} from "recharts";

const CHART_CONFIG = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
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
  renderTooltip: (value: FloatDataPoint) => React.ReactNode;
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
  renderTooltip,
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
          <ChartContainer config={CHART_CONFIG}>
            <BaseLineChart accessibilityLayer data={downsampled}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="x"
                tickLine={false}
                axisLine={false}
                ticks={ticks}
                dy={16}
                tickFormatter={(value) =>
                  formatDate(value, { month: "short", year: "2-digit" })
                }
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                dataKey="y"
                stroke="var(--color-brand)"
                strokeWidth={2}
                dot={false}
              />
            </BaseLineChart>
          </ChartContainer>
        </Skeleton>
      </CardContent>
    </Card>
  );
};
