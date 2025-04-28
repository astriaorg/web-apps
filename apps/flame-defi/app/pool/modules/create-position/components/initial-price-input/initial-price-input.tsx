import type { EvmCurrency } from "@repo/flame-types";
import {
  Card,
  CardContent,
  CardDescription,
  TokenAmountInput,
} from "@repo/ui/components";
import { useMemo } from "react";
import { useIntl } from "react-intl";

interface InitialPriceInputProps {
  rate?: string;
  token0?: EvmCurrency;
  token1?: EvmCurrency;
}

export const InitialPriceInput = ({
  rate,
  token0,
  token1,
}: InitialPriceInputProps) => {
  const { formatNumber } = useIntl();

  const exchangeRate = useMemo(() => {
    if (!token0 || !token1) {
      return null;
    }

    return `${token0.coinDenom} = 1 ${token1.coinDenom}`;
  }, [token0, token1, formatNumber]);

  return (
    <div className="flex flex-col gap-6">
      <Card variant="accent" className="bg-warning/20">
        <CardContent className="p-4">
          <CardDescription>
            This pool must be initialized before you can add liquidity. To
            initialize, enter a starting price for the pool. Then, enter your
            liquidity price range and deposit amount. Gas fees will be higher
            than usual due to the initialization transaction.
          </CardDescription>
        </CardContent>
      </Card>

      <Card variant="secondary">
        <CardContent>
          <div className="flex items-center mb-4">
            <span>Initial Price</span>
          </div>
          <TokenAmountInput />

          <div className="flex items-center gap-2 text-sm mt-2">
            <span>{exchangeRate}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
