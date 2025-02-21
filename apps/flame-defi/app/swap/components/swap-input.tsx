import { EvmCurrency, GetQuoteResult, TokenState } from "@repo/flame-types";
import { TokenSelector } from "@repo/ui/components";
import { Skeleton } from "@repo/ui/shadcn-primitives";
import {
  FORMAT_ABBREVIATED_NUMBER_SUFFIX,
  formatAbbreviatedNumber,
  formatNumber,
  isDustAmount,
} from "@repo/ui/utils";

import { useIntl } from "react-intl";
import useUsdQuote from "../use-usd-quote";

interface SwapInputProps {
  inputToken: TokenState;
  oppositeToken: TokenState;
  onInputChange: (value: string, index: number) => void;
  availableTokens?: EvmCurrency[];
  onTokenSelect: (token: EvmCurrency, index: number) => void;
  label: string;
  txnQuoteData: GetQuoteResult | null;
  txnQuoteLoading: boolean;
  txnQuoteError: string | null;
  index: number;
  balance: string;
}

export function SwapInput({
  inputToken,
  onInputChange,
  availableTokens,
  oppositeToken,
  onTokenSelect,
  label,
  txnQuoteLoading,
  index,
  balance,
}: SwapInputProps) {
  const { locale } = useIntl();
  const usdQuote = useUsdQuote(inputToken);

  const handleFiatValue = () => {
    const formatNumber = (value: string) => {
      const { value: formattedValue, suffix } = formatAbbreviatedNumber(value);

      const localeString = (+formattedValue).toLocaleString(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: "currency",
        currency: "USD",
      });

      // If the return string is -0.00 or some variant, strip the negative
      if (localeString.match(/-0\.?[0]*$/)) {
        return localeString.replace("-", "");
      }

      return `${formattedValue}${suffix === FORMAT_ABBREVIATED_NUMBER_SUFFIX.THOUSAND ? "" : suffix}`;
    };

    if (inputToken.token?.coinDenom === "USDC" && inputToken.value !== "") {
      return formatNumber(inputToken.value);
    } else if (usdQuote?.quote) {
      return formatNumber(usdQuote?.quote?.quoteDecimals);
    } else {
      return "-";
    }
  };

  const fiatValue =
    inputToken.value !== "" && inputToken.value !== "0"
      ? handleFiatValue()
      : "-";

  return (
    <div
      className={`flex flex-col rounded-md p-4 transition border border-solid border-transparent bg-semi-white hover:border-grey-medium focus-within:bg-background focus-within:border-grey-medium`}
    >
      <div className="text-base font-medium text-grey-light">{label}</div>
      <div className="flex justify-between items-center">
        <Skeleton
          isLoading={txnQuoteLoading && inputToken.isQuoteValue}
          className="rounded w-[45%] sm:max-w-[62%] h-[40px] mt-3"
        >
          <input
            type="number"
            value={inputToken.value}
            onChange={(e) => {
              onInputChange(e.target.value, index);
            }}
            className="normalize-input w-[45%] sm:max-w-[62%] text-ellipsis overflow-hidden text-[36px]"
            placeholder="0"
          />
        </Skeleton>
        <div className="flex flex-col items-end">
          <TokenSelector
            tokens={availableTokens}
            selectedToken={inputToken.token}
            unavailableToken={oppositeToken?.token}
            setSelectedToken={(token) => onTokenSelect(token, index)}
          />
          {inputToken.token && balance && !isDustAmount(balance) ? (
            <div className="text-sm font-medium text-grey-light flex items-center mt-3">
              <span className="flex items-center gap-2">
                {formatNumber(balance)} {inputToken?.token?.coinDenom}
              </span>
              {
                <span
                  onClick={() => {
                    onInputChange(balance, index);
                  }}
                  className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-orange-soft text-sm cursor-pointer transition"
                >
                  Max
                </span>
              }
            </div>
          ) : (
            <div className="h-[20px] mt-3 w-[100%]"></div>
          )}
        </div>
      </div>
      <div>
        <Skeleton
          isLoading={usdQuote?.loading || txnQuoteLoading}
          className="rounded w-[70px]"
        >
          <span className="text-sm font-medium text-grey-light">
            {fiatValue}
          </span>
        </Skeleton>
      </div>
    </div>
  );
}
