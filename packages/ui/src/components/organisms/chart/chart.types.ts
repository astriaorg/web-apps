export const CHART_TICK_INTERVALS = ["1d", "3d", "1w", "1m"] as const;
export type ChartTickInterval = (typeof CHART_TICK_INTERVALS)[number];
export const CHART_INTERVALS = ["1w", "1m", "3m", "all"] as const;
export type ChartInterval = (typeof CHART_INTERVALS)[number];
