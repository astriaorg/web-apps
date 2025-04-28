import type { EvmCurrency } from "@repo/flame-types";

export interface CreatePositionInputProps {
  rate?: string;
  token0?: EvmCurrency;
  token1?: EvmCurrency;
}
