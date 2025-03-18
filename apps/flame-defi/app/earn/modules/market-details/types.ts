export const TOTAL_ASSETS_OPTIONS = ["BORROW", "SUPPLY", "LIQUIDITY"] as const;
export type TotalAssetsOption = (typeof TOTAL_ASSETS_OPTIONS)[number];
export const TOTAL_ASSETS_OPTION = {
  BORROW: "BORROW",
  SUPPLY: "SUPPLY",
  LIQUIDITY: "LIQUIDITY",
} as const;
