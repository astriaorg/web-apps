import { TokenSelector } from "@repo/ui/components";
import { EvmCurrency, TokenState } from "@repo/ui/types";
import { formatBalanceValues } from "utils/utils";

interface SwapInputProps {
  inputValue: TokenState;
  onInputChange: (value: string) => void;
  availableTokens?: EvmCurrency[];
  selectedToken?: EvmCurrency | null;
  oppositeToken?: EvmCurrency | null;
  onTokenSelect: (token: EvmCurrency) => void;
  balance?: {
    value: string;
    symbol: string;
  } | null;
  label: string;
}

export function SwapInput({
  inputValue,
  onInputChange,
  availableTokens,
  selectedToken,
  oppositeToken,
  onTokenSelect,
  balance,
  label,
}: SwapInputProps) {

  return (
    <div
      className={`flex flex-col rounded-md p-4 transition border border-solid border-transparent bg-semi-white hover:border-grey-medium focus-within:bg-background focus-within:border-grey-medium`}
    >
      <div className="text-base font-medium text-grey-light">{label}</div>
      <div className="flex justify-between items-center">
        <input
          type="number"
          value={inputValue.value}
          onChange={(e) => {
            onInputChange(e.target.value);
          }}
          className="normalize-input w-[45%] sm:max-w-[62%] text-ellipsis overflow-hidden"
          placeholder="0"
        />
        <div className="flex flex-col items-end">
          <TokenSelector
            tokens={availableTokens}
            selectedToken={selectedToken}
            unavailableToken={oppositeToken}
            setSelectedToken={onTokenSelect}
          />
          {selectedToken ? (
            <div className="text-sm font-medium text-grey-light flex items-center mt-3">
              <span className="flex items-center gap-2">
                {formatBalanceValues(balance?.value)} {balance?.symbol}
              </span>
              {balance?.value && parseFloat(balance?.value) > 0 && <span
                onClick={() => {
                  onInputChange(balance?.value || "0");
                }}
                className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-orange-soft text-sm cursor-pointer transition"
              >
                Max
              </span>}
            </div>
          ) : (
            <div className="h-[20px] mt-3 w-[100%]"></div>
          )}
        </div>
      </div>
      <div>
        {/* TODO: add this value */}
        <span className="text-sm font-medium text-grey-light">$0</span>
      </div>
    </div>
  );
}