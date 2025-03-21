import { ChartInterval } from "@repo/ui/components";

export const CHART_CACHE_TIME_MILLISECONDS = 1000 * 60 * 5; // 5 minutes.

export const CHART_TYPE = {
  APY: "APY",
  TOTAL_ASSETS: "TOTAL_ASSETS",
} as const;

export type Charts<T> = {
  [key in keyof typeof CHART_TYPE]: {
    selectedInterval: ChartInterval;
    setSelectedInterval: (value: ChartInterval) => void;
    selectedOption?: string;
    setSelectedOption?: (value: string) => void;
    query: T;
  };
};
