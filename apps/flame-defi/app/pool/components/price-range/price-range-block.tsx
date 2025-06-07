import type { ReactNode } from "react";

import type { EvmCurrency } from "@repo/flame-types";
import { CardFigureLabel, CardLabel } from "@repo/ui/components";

import { PricePerTokenLabel } from "./price-per-token-label";

export const PriceRangeBlock = ({
  token0,
  token1,
  price,
  label,
}: {
  token0?: EvmCurrency;
  token1?: EvmCurrency;
  price?: string;
  label: ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <CardLabel className="text-xs font-medium tracking-wider uppercase">
        {label}
      </CardLabel>
      {/* Use sans instead of dot font because the dot font infinity symbol looks weird. */}
      <CardFigureLabel className="text-typography-light font-sans truncate">
        {price}
      </CardFigureLabel>
      <PricePerTokenLabel token0={token0} token1={token1} />
      <CardLabel className="text-xs text-typography-subdued">
        Your position will be 100% {token0?.coinDenom} at this price.
      </CardLabel>
    </div>
  );
};
