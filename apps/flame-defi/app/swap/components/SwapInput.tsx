import { TokenSelector } from "@repo/ui/components";
import { EvmCurrency, GetQuoteResult, TokenState } from "@repo/ui/types";
import { TOKEN_INPUTS } from "../../constants";
import useUsdQuote from "swap/useUsdQuote";
import { formatDecimalValues } from "utils/utils";
import { isTiaWtiaSwapPair } from "swap/page";

interface SwapInputProps {
  inputToken: TokenState;
  oppositeToken: TokenState;
  onInputChange: (value: string) => void;
  availableTokens?: EvmCurrency[];
  onTokenSelect: (token: EvmCurrency) => void;
  onInputClick: (index: number, id: TOKEN_INPUTS) => void;
  balance?: {
    value: string;
    symbol: string;
  } | null;
  label: string;
  txnQuoteData: GetQuoteResult | null;
  txnQuoteLoading: boolean;
  txnQuoteError: string | null;
  id: TOKEN_INPUTS;
  index: number;
  selectedIndex: number;
  quoteInput: TokenState;
}

export function SwapInput({
  inputToken,
  onInputChange,
  selectedIndex,
  availableTokens,
  quoteInput,
  oppositeToken,
  onTokenSelect,
  onInputClick,
  balance,
  label,
  txnQuoteLoading,
  id,
  index,
}: SwapInputProps) {
  const isSelected = selectedIndex === index;
  const usdQuote = useUsdQuote(inputToken, quoteInput, isSelected)

  const isTiaWtia = isTiaWtiaSwapPair(inputToken, oppositeToken);

  const handleUsdValue = () => {
      if(usdQuote?.loading || txnQuoteLoading){
      return "loading..."
    } else if(inputToken.token?.coinDenom === "USDC" && inputToken.value !== ""){
      return `$${formatDecimalValues(inputToken.value, 2)}`
    } else if(usdQuote?.quote){
      return `$${formatDecimalValues(usdQuote?.quote?.quoteDecimals, 2)}`
    } else {
      return "-"
    }
  }

  return (
    <div
      className={`flex flex-col rounded-md p-4 transition border border-solid border-transparent bg-semi-white hover:border-grey-medium focus-within:bg-background focus-within:border-grey-medium`}
    >
      <div className="text-base font-medium text-grey-light">{label}</div>
      <div className="flex justify-between items-center">
        {txnQuoteLoading && !isSelected && !isTiaWtia ? <div className="w-[45%] sm:max-w-[62%] h-[20px] mt-3">Loading...</div> : 
        <input
          type="number"
          value={isSelected || isTiaWtia ? inputToken.value : quoteInput.value}
          onChange={(e) => {
            onInputChange(e.target.value);
            onInputClick(index, id)
          }}
          className="normalize-input w-[45%] sm:max-w-[62%] text-ellipsis overflow-hidden"
          placeholder="0"
        />}
        <div className="flex flex-col items-end">
          <TokenSelector
            tokens={availableTokens}
            selectedToken={inputToken.token}
            unavailableToken={oppositeToken?.token}
            setSelectedToken={onTokenSelect}
          />
          {inputToken.token && parseFloat(balance?.value || "0") > 0 ? (
            <div className="text-sm font-medium text-grey-light flex items-center mt-3">
              <span className="flex items-center gap-2">
                {formatDecimalValues(balance?.value)} {balance?.symbol}
              </span>
              {balance?.value && parseFloat(balance?.value) > 0 && <span
                onClick={() => {
                  onInputChange(balance?.value || "0");
                  onInputClick(index, id)
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
        <span className="text-sm font-medium text-grey-light">{handleUsdValue()}</span>
      </div>
    </div>
  );
}