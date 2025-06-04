import type { EvmCurrency } from "@repo/flame-types";
import {
  TokenAmountInputBalance,
  type TokenAmountInputBalanceProps,
} from "components/token-amount-input-balance";
import { TokenSelect } from "components/token-select";
import {
  TokenAmountInput as BaseTokenAmountInput,
  type TokenAmountInputProps as BaseTokenAmountInputProps,
} from "pool/components/token-amount-input";

interface TokenAmountInputProps
  extends BaseTokenAmountInputProps,
    TokenAmountInputBalanceProps {
  options: EvmCurrency[];
  selectedToken?: EvmCurrency;
  setSelectedToken: (value?: EvmCurrency) => void;
}

export const TokenAmountInput = ({
  value,
  onInput,
  selectedToken,
  setSelectedToken,
  options,
  balance,
  isLoading,
}: TokenAmountInputProps) => {
  return (
    <BaseTokenAmountInput value={value} onInput={onInput}>
      <div className="flex flex-col gap-1 items-end pt-5">
        <TokenSelect
          options={options}
          value={selectedToken}
          onValueChange={setSelectedToken}
        />
        <TokenAmountInputBalance
          balance={balance}
          onInput={onInput}
          isLoading={isLoading}
        />
      </div>
    </BaseTokenAmountInput>
  );
};
