import { useIntl } from "react-intl";

import type { EvmCurrency } from "@repo/flame-types";
import { TokenIcon } from "@repo/ui/components";

export const TransactionSummaryTokenRow = ({
  token,
  value,
}: {
  token: EvmCurrency;
  value: string;
}) => {
  const { formatNumber } = useIntl();

  return (
    <div key={token.coinDenom} className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <TokenIcon symbol={token.coinDenom} size={20} />
        {token.coinDenom}
      </span>
      <span>
        {formatNumber(Number(value), {
          minimumFractionDigits: token.coinDecimals,
          maximumFractionDigits: token.coinDecimals,
        })}
      </span>
    </div>
  );
};
