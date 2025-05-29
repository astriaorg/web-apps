import { Button } from "@repo/ui/components";

import type { CollectFeesTransactionSummaryProps } from "./transaction-summary.types";
import { TransactionSummaryTokenRow } from "./transaction-summary-token-row";

export const CollectFeesTransactionSummary = ({
  token0,
  token1,
  unclaimedFees0,
  unclaimedFees1,
  onSubmit,
}: CollectFeesTransactionSummaryProps) => {
  return (
    <div className="flex flex-col justify-start items-center gap-3">
      <div className="flex flex-col p-4 rounded-xl w-full text-lg gap-2">
        <TransactionSummaryTokenRow token={token0} value={unclaimedFees0} />
        <TransactionSummaryTokenRow token={token1} value={unclaimedFees1} />
      </div>

      <span className="text-sm">
        Collecting fees will withdraw all currently available fees for you.
      </span>

      <Button className="w-full mt-6" onClick={onSubmit}>
        Collect Fees
      </Button>
    </div>
  );
};
