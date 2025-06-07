import { useIntl } from "react-intl";

import type { EvmCurrency } from "@repo/flame-types";
import { Button, Card, TokenIcon } from "@repo/ui/components";
import { ArrowDownIcon } from "@repo/ui/icons";
import { SwapButton } from "components/swap-button";
import { TransactionInfoDetails } from "swap/components/transaction-info-details";

import type { SwapSummaryProps } from "./transaction-summary.types";

const AmountRow = ({
  amount,
  token,
}: {
  amount: string;
  token: EvmCurrency;
}) => {
  const { formatNumber } = useIntl();

  return (
    <Card className="w-full">
      <div className="w-full flex items-center justify-between gap-2 px-6 py-8">
        <span className="w-full text-xl flex-1">
          {formatNumber(Number(amount), {
            minimumFractionDigits: token.coinDecimals,
            maximumFractionDigits: token.coinDecimals,
          })}
        </span>
        <div className="flex items-center gap-2">
          <TokenIcon symbol={token.coinDenom} />
          <span>{token.coinDenom}</span>
        </div>
      </div>
    </Card>
  );
};

export const SwapTransactionSummary = ({
  token0,
  token1,
  action,
  onSubmit,
  fee,
  amount0,
  amount1,
  amountOut,
  amountMin,
  priceImpact,
  frontendFeeEstimate,
}: SwapSummaryProps) => {
  return (
    <div className="flex flex-col justify-start items-center gap-3">
      <div className="flex flex-col items-center w-full mb-6">
        <AmountRow amount={amount0} token={token0} />
        <SwapButton icon={<ArrowDownIcon />} className="pointer-events-none" />
        <AmountRow amount={amount1} token={token1} />
      </div>

      <TransactionInfoDetails
        token={token1}
        fee={fee}
        amountOut={amountOut}
        amountMin={amountMin}
        priceImpact={priceImpact}
        frontendFeeEstimate={frontendFeeEstimate}
      />

      <Button className="w-full mt-6" onClick={onSubmit}>
        {action}
      </Button>
    </div>
  );
};
