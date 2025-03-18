export const CHART_TYPE = {
  APY: "APY",
  TOTAL_ASSETS: "TOTAL_ASSETS",
} as const;

export const TOTAL_ASSETS_OPTIONS = ["ASSET", "FIAT"] as const;
export type TotalAssetsOption = (typeof TOTAL_ASSETS_OPTIONS)[number];
export const TOTAL_ASSETS_OPTION = {
  ASSET: "ASSET",
  FIAT: "FIAT",
} as const;
