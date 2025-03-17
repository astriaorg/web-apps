export const CHART_CACHE_TIME_MILLISECONDS = 1000 * 60 * 5; // 5 minutes.

export const CHART_INTERVALS = ["1w", "1m", "3m", "all"] as const;
export type ChartInterval = (typeof CHART_INTERVALS)[number];

export const CHART_TYPE = {
  APY: "APY",
  TOTAL_ASSETS: "TOTAL_ASSETS",
} as const;
