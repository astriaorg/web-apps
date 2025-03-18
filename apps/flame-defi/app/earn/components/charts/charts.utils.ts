import { ChartInterval, getTimestampsFromInterval } from "@repo/ui/components";
import Big from "big.js";
import type {
  BigIntDataPoint,
  TimeseriesOptions,
} from "earn/generated/gql/graphql";
import { CHART_CACHE_TIME_MILLISECONDS } from "./charts.types";

/**
 * @returns The start and end timestamps for the given chart interval.
 */
export const getTimeseriesOptions = (
  chartInterval: ChartInterval,
): TimeseriesOptions => {
  const { startTimestamp, endTimestamp } =
    getTimestampsFromInterval(chartInterval);

  if (chartInterval === "all") {
    return {
      startTimestamp,
      endTimestamp,
    };
  }

  // Timestamps change every second, so query is never cached.
  // Round down to the nearest 5 minutes to avoid this.
  const roundDownToNearest5Minutes = (timestamp: number) => {
    const secondsIn5Minutes = CHART_CACHE_TIME_MILLISECONDS / 1000;
    return Math.floor(timestamp / secondsIn5Minutes) * secondsIn5Minutes;
  };

  return {
    startTimestamp: Math.floor(
      roundDownToNearest5Minutes((startTimestamp as number) / 1000),
    ),
    endTimestamp: Math.floor(
      roundDownToNearest5Minutes((endTimestamp as number) / 1000),
    ),
  };
};

/**
 * Scales and sorts the data. Call this at the query level to prevent number overflow issues when rendering the chart.
 */
export const getSortedAndScaledData = (
  data: BigIntDataPoint[] | null = null,
  decimals: number,
) => {
  if (!data) {
    return null;
  }

  return data
    .map((it) => {
      //
      return {
        ...it,
        y: new Big(it.y).div(10 ** decimals).toNumber(), // Convert to number, if we leave as a string the chart will have number overflow issues.
      };
    })
    .sort((a, b) => a.x - b.x);
};
