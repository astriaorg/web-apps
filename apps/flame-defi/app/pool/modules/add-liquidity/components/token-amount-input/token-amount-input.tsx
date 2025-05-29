import type { EvmCurrency } from "@repo/flame-types";
import { Button, Skeleton, TokenIcon } from "@repo/ui/components";
import {
  TokenAmountInputBalance,
  type TokenAmountInputBalanceProps,
} from "components/token-amount-input-balance";
import {
  TokenAmountInput as BaseTokenAmountInput,
  type TokenAmountInputProps as BaseTokenAmountInputProps,
} from "pool/components/token-amount-input";

interface TokenAmountInputProps
  extends BaseTokenAmountInputProps,
    TokenAmountInputBalanceProps {
  token?: EvmCurrency;
}

export const TokenAmountInput = ({
  value,
  onInput,
  balance,
  isLoading,
  token,
}: TokenAmountInputProps) => {
  return (
    <BaseTokenAmountInput value={value} onInput={onInput}>
      <div className="flex flex-col gap-1 items-end">
        <Skeleton isLoading={!token} className="w-18">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <TokenIcon size={16} symbol={token?.coinDenom} />
              <span>{token?.coinDenom}</span>
            </div>
          </Button>
        </Skeleton>
        <TokenAmountInputBalance
          balance={balance}
          onInput={onInput}
          isLoading={isLoading}
        />
      </div>
    </BaseTokenAmountInput>
  );
};
