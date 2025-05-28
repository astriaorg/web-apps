import { Button, Card, CardContent } from "@repo/ui/components";
import { PriceRangeBlock } from "pool/components/price-range";
import { getDisplayMaxPrice, getDisplayMinPrice } from "pool/utils";

import type { CreatePositionSummaryProps } from "./transaction-summary.types";
import { TransactionSummaryTokenRow } from "./transaction-summary-token-row";

export const CreatePositionTransactionSummary = ({
  token0,
  token1,
  amount0,
  amount1,
  minPrice,
  maxPrice,
  onSubmit,
}: CreatePositionSummaryProps) => {
  return (
    <div className="flex flex-col justify-start items-center gap-3">
      <div className="flex flex-col p-4 rounded-xl w-full text-lg gap-2">
        <TransactionSummaryTokenRow token={token0} value={amount0} />
        <TransactionSummaryTokenRow token={token1} value={amount1} />
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <PriceRangeBlock
            token0={token0}
            token1={token1}
            price={getDisplayMinPrice(minPrice, { minimumFractionDigits: 4 })}
            label="Min Price"
          />
          <PriceRangeBlock
            token0={token0}
            token1={token1}
            price={getDisplayMaxPrice(maxPrice, { minimumFractionDigits: 4 })}
            label="Max Price"
          />
        </CardContent>
      </Card>

      <Button className="w-full mt-6" onClick={onSubmit}>
        Create New Position
      </Button>
    </div>
  );
};
