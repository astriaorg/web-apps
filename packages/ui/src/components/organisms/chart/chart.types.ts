// Format: { THEME_NAME: CSS_SELECTOR }
export const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

export type ChartContextProps = {
  config: ChartConfig;
};

export const CHART_TICK_INTERVALS = ["3d", "1w", "1m"] as const;
export type ChartTickInterval = (typeof CHART_TICK_INTERVALS)[number];
export const CHART_INTERVALS = ["1w", "1m", "3m", "all"] as const;
export type ChartInterval = (typeof CHART_INTERVALS)[number];
