import { useIntl } from "react-intl";

import { Button, TokenIcon } from "@repo/ui/components";

import type { TransactionSummaryProps } from "./transaction-summary.types";

export const CollectFeesTransactionSummary = ({
  token0,
  token1,
  unclaimedFees0,
  unclaimedFees1,
  onSubmit,
}: TransactionSummaryProps) => {
  const { formatNumber } = useIntl();

  return (
    <div className="flex flex-col justify-start items-center gap-3">
      <div className="flex flex-col p-4 rounded-xl w-full text-lg gap-2">
        <div
          key={token0.coinDenom}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <TokenIcon symbol={token0.coinDenom} size={20} />
            {token0.coinDenom}
          </span>
          <span>
            {formatNumber(+unclaimedFees0, {
              minimumFractionDigits: token0.coinDecimals,
              maximumFractionDigits: token0.coinDecimals,
            })}
          </span>
        </div>

        <div
          key={token1.coinDenom}
          className="flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <TokenIcon symbol={token1.coinDenom} size={20} />
            {token1.coinDenom}
          </span>
          <span>
            {formatNumber(+unclaimedFees1, {
              minimumFractionDigits: token1.coinDecimals,
              maximumFractionDigits: token1.coinDecimals,
            })}
          </span>
        </div>
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
