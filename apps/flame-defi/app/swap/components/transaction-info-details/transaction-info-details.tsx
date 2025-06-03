import type { EvmCurrency } from "@repo/flame-types";
import { InfoTooltip } from "@repo/ui/components";
import { getSlippageTolerance } from "@repo/ui/utils";

interface TransactionInfoDetailsProps {
  token: EvmCurrency;
  fee: string;
  amountOut: string;
  amountMin: string;
  priceImpact: string;
  frontendFeeEstimate?: string;
}

const TransactionInfoRow = ({
  left,
  right,
  tooltip,
}: {
  left: string;
  right: string;
  tooltip: string;
}) => {
  return (
    <p className="flex justify-between">
      <span className="text-typography-subdued flex items-center gap-1">
        {left}
        &nbsp;
        <InfoTooltip content={tooltip} side="right" className="max-w-[250px]" />
      </span>
      <span className="text-typography-subdued">{right}</span>
    </p>
  );
};

export const TransactionInfoDetails = ({
  token,
  fee,
  amountOut,
  amountMin,
  priceImpact,
  frontendFeeEstimate,
}: TransactionInfoDetailsProps) => {
  const slippageTolerance = getSlippageTolerance();

  return (
    <div className="flex flex-col space-y-2 w-full">
      <TransactionInfoRow
        left="Expected Output"
        right={`${amountOut} ${token.coinDenom}`}
        tooltip="The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending."
      />
      <TransactionInfoRow
        left="Price Impact"
        right={priceImpact}
        tooltip="The impact your trade has on the market price of this pool."
      />
      <TransactionInfoRow
        left="Network Fee"
        right={`$${fee}`}
        tooltip="The network fee for the transaction."
      />
      {Boolean(frontendFeeEstimate) && (
        <TransactionInfoRow
          // TODO: Show fee percentage from config.
          left="Fee (0.25%)"
          right={`${frontendFeeEstimate} ${token.coinDenom}`}
          tooltip="Fees are applied to ensure the best experience on Flame, and have already been factored into this quote."
        />
      )}
      <TransactionInfoRow
        left={`Min Received After Slippage (${slippageTolerance}%)`}
        right={`${amountMin} ${token.coinDenom}`}
        tooltip="The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will revert."
      />
    </div>
  );
};
