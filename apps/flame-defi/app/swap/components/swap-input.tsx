import { useIntl } from "react-intl";
import { useAccount } from "wagmi";

import { Skeleton, TokenSelector } from "@repo/ui/components";
import { formatAbbreviatedNumber, isDustAmount } from "@repo/ui/utils";
import { AddErc20ToWalletButton, useUsdQuote } from "features/evm-wallet";
import { SwapInputProps } from "swap/types";

export function SwapInput({
  availableTokens,
  balance,
  id,
  inputToken,
  label,
  onInputChange,
  onTokenSelect,
  oppositeToken,
  txnQuoteLoading,
}: SwapInputProps) {
  const { locale, formatNumber } = useIntl();
  const { isConnected } = useAccount();
  const usdQuote = useUsdQuote(inputToken);

  const handleFiatValue = () => {
    const formatFiat = (value: string) => {
      const { value: formattedValue } = formatAbbreviatedNumber(value, {
        threshold: "million",
      });
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

      return localeString;
    };

    if (inputToken.token?.coinDenom === "USDC" && inputToken.value !== "") {
      return formatFiat(inputToken.value);
    } else if (usdQuote.quote) {
      return formatFiat(usdQuote.quote.quoteDecimals);
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
      className={`flex flex-col rounded-xl p-4 transition border border-solid border-transparent bg-semi-white hover:border-grey-medium focus-within:bg-background focus-within:border-grey-medium`}
    >
      <div className="text-base font-medium text-grey-light">{label}</div>
      <div className="flex justify-between items-center">
        <Skeleton
          isLoading={txnQuoteLoading && inputToken.isQuoteValue}
          className="rounded-sm w-[45%] sm:max-w-[62%] h-[40px] mt-3"
        >
          <input
            type="number"
            value={inputToken.value}
            onChange={(e) => {
              onInputChange(e.target.value, id);
            }}
            className="normalize-input w-[45%] sm:max-w-[62%] text-ellipsis overflow-hidden text-[36px]"
            placeholder="0"
          />
        </Skeleton>
        <div className="flex flex-col items-end">
          <TokenSelector
            tokens={availableTokens}
            selectedToken={inputToken.token}
            unavailableToken={oppositeToken.token}
            setSelectedToken={(token) =>
              onTokenSelect(token, oppositeToken, id)
            }
          />
          {inputToken.token && balance && !isDustAmount(balance) ? (
            <div className="text-sm font-medium text-grey-light flex items-center mt-3">
              <span className="flex items-center gap-2">
                {formatNumber(parseFloat(balance), {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}{" "}
                {inputToken.token?.coinDenom}
              </span>
              {
                <span
                  onClick={() => {
                    onInputChange(balance, id);
                  }}
                  className="px-3 py-0 ml-2 rounded-2xl bg-grey-dark hover:bg-grey-medium text-white text-sm cursor-pointer transition"
                >
                  Max
                </span>
              }
            </div>
          ) : (
            <div></div>
          )}
          {inputToken.token && !inputToken.token.isNative && isConnected && (
            <div className="mt-1 text-right">
              <AddErc20ToWalletButton evmCurrency={inputToken.token} />
            </div>
          )}
        </div>
      </div>
      <div>
        <Skeleton
          isLoading={usdQuote.loading || txnQuoteLoading}
          className="rounded-sm w-[70px]"
        >
          <span className="text-sm font-medium text-grey-light">
            {fiatValue}
          </span>
        </Skeleton>
      </div>
    </div>
  );
}
