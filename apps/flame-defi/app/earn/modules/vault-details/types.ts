export const APY_CHART_INTERVALS = ["1w", "1m", "3m", "all"] as const;
export type APYChartInterval = (typeof APY_CHART_INTERVALS)[number];
