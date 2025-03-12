import type { TimeseriesOptions } from "earn/generated/gql/graphql";
import {
  CHART_CACHE_TIME_MILLISECONDS,
  ChartInterval,
} from "earn/modules/vault-details/types";

/**
 * @returns The start and end timestamps for the given chart interval.
 */
export const getTimeseriesOptions = (
  chartInterval: ChartInterval,
): TimeseriesOptions => {
  if (chartInterval === "all") {
    return {
      startTimestamp: null,
      endTimestamp: null,
    };
  }

  // Timestamps change every second, so query is never cached.
  // Round down to the nearest 5 minutes to avoid this.
  const roundDownToNearest5Minutes = (timestamp: number) => {
    const secondsIn5Minutes = CHART_CACHE_TIME_MILLISECONDS / 1000;
    return Math.floor(timestamp / secondsIn5Minutes) * secondsIn5Minutes;
  };

  const getTimestampsFromInterval = (interval: ChartInterval) => {
    const now = Date.now();
    const date = new Date();

    switch (interval) {
      case "1w": {
        date.setDate(date.getDate() - 7);
        return {
          startTimestamp: date.getTime(),
          endTimestamp: now,
        };
      }
      case "1m": {
        date.setMonth(date.getMonth() - 1);
        return {
          startTimestamp: date.getTime(),
          endTimestamp: now,
        };
      }
      case "3m": {
        date.setMonth(date.getMonth() - 3);
        return {
          startTimestamp: date.getTime(),
          endTimestamp: now,
        };
      }
      default: {
        throw new Error(`Invalid interval: "${interval}".`);
      }
    }
  };

  const { startTimestamp, endTimestamp } =
    getTimestampsFromInterval(chartInterval);

  return {
    startTimestamp: Math.floor(
      roundDownToNearest5Minutes(startTimestamp / 1000),
    ),
    endTimestamp: Math.floor(roundDownToNearest5Minutes(endTimestamp / 1000)),
  };
};
