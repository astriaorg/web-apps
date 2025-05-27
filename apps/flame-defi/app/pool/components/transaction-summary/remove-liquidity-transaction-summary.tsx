import Big from "big.js";

import { Button } from "@repo/ui/components";

import type { RemoveLiquidityTransactionSummaryProps } from "./transaction-summary.types";
import { TransactionSummaryTokenRow } from "./transaction-summary-token-row";

export const RemoveLiquidityTransactionSummary = ({
  token0,
  token1,
  amount0,
  amount1,
  percentage,
  onSubmit,
}: RemoveLiquidityTransactionSummaryProps) => {
  return (
    <div className="flex flex-col justify-start items-center gap-3">
      <div className="flex flex-col p-4 rounded-xl w-full text-lg gap-2">
        <TransactionSummaryTokenRow
          token={token0}
          value={new Big(amount0)
            .mul(percentage)
            .div(100)
            .toFixed(token0.coinDecimals)}
        />
        <TransactionSummaryTokenRow
          token={token1}
          value={new Big(amount1)
            .mul(percentage)
            .div(100)
            .toFixed(token1.coinDecimals)}
        />
      </div>

      <Button className="w-full mt-6" onClick={onSubmit}>
        Remove Liquidity
      </Button>
    </div>
  );
};
