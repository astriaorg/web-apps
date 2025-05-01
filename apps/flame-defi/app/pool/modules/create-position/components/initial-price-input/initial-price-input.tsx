import { useMemo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  TokenAmountInput,
} from "@repo/ui/components";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";

const UNINITIALIZED_POOL_WARNING =
  "This pool must be initialized before you can add liquidity. To initialize, enter a starting price for the pool. Then, enter your deposit amount and liquidity price range. Gas fees will be higher than usual due to the initialization transaction.";

export const InitialPriceInput = () => {
  const { token0, token1, amountInitialPrice, setAmountInitialPrice } =
    usePageContext();

  const exchangeRate = useMemo(() => {
    if (!token0 || !token1) {
      return null;
    }

    return `${token0.coinDenom} = 1 ${token1.coinDenom}`;
  }, [token0, token1]);

  return (
    <div className="flex flex-col gap-6">
      <Card variant="accent" className="bg-warning/20">
        <CardContent className="p-4">
          <CardDescription>{UNINITIALIZED_POOL_WARNING}</CardDescription>
        </CardContent>
      </Card>

      <Card variant="secondary">
        <CardContent>
          <div className="flex items-center mb-4">
            <span>Initial Price</span>
          </div>
          <TokenAmountInput
            value={amountInitialPrice.value}
            onInput={(event) =>
              setAmountInitialPrice({ value: event.currentTarget.value })
            }
          />

          <div className="flex items-center gap-2 text-sm mt-2">
            <span>{exchangeRate}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
