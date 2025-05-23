import type { EvmCurrency } from "@repo/flame-types";
import { CardLabel } from "@repo/ui/components";

export const PricePerTokenLabel = ({
  token0,
  token1,
}: {
  token0?: EvmCurrency;
  token1?: EvmCurrency;
}) => {
  return (
    <CardLabel className="text-xs font-medium">
      {token0?.coinDenom} per {token1?.coinDenom}
    </CardLabel>
  );
};
