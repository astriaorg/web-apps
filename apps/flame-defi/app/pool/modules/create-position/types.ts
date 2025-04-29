import type { EvmCurrency } from "@repo/flame-types";

export interface CreatePositionInputProps {
  rate?: string;
  token0?: EvmCurrency;
  token1?: EvmCurrency;
}

export const MIN_PRICE_DEFAULT = 0;
export const MAX_PRICE_DEFAULT = Infinity;
