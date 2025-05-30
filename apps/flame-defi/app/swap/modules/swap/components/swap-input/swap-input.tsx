import { useMemo } from "react";
import { useIntl } from "react-intl";
import { useAccount } from "wagmi";

import {
  Card,
  CardContent,
  CardFigureInput,
  Skeleton,
} from "@repo/ui/components";
import { formatAbbreviatedNumber } from "@repo/ui/utils";
import { TokenAmountInputBalance } from "components/token-amount-input-balance";
import { TokenSelect } from "components/token-select";
import { AddErc20ToWalletButton, useUsdQuote } from "features/evm-wallet";
import { SwapInputProps } from "swap/types";

export const SwapInput = ({
  availableTokens,
  balance,
  isBalanceLoading,
  id,
  inputToken,
  label,
  onInputChange,
  onTokenSelect,
  oppositeToken,
  isQuoteLoading,
}: SwapInputProps) => {
  const { locale } = useIntl();
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

  const options = useMemo(() => {
    return availableTokens.filter((token) => {
      // Exclude the input token and the opposite token from the options.
      return (
        (inputToken.token
          ? token.erc20ContractAddress !== inputToken.token.erc20ContractAddress
          : true) &&
        (oppositeToken.token
          ? token.erc20ContractAddress !==
            oppositeToken.token.erc20ContractAddress
          : true)
      );
    });
  }, [availableTokens, inputToken.token, oppositeToken.token]);

  return (
    <Card variant="secondary">
      <CardContent>
        <div className="flex justify-between items-center gap-6">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-medium tracking-wider uppercase text-typography-subdued mb-1">
              {label}
            </div>
            <Skeleton
              isLoading={isQuoteLoading && inputToken.isQuoteValue}
              className="w-[45%] sm:max-w-[60%]"
            >
              <CardFigureInput
                value={inputToken.value}
                onInput={(event) =>
                  onInputChange(event.currentTarget.value, id)
                }
              />
            </Skeleton>
            <Skeleton
              isLoading={usdQuote.isLoading || isQuoteLoading}
              className="w-18"
            >
              <span className="text-sm font-medium text-typography-subdued">
                {fiatValue}
              </span>
            </Skeleton>
          </div>
          <div className="flex flex-col gap-1 items-end pt-5">
            <TokenSelect
              options={options}
              value={inputToken.token}
              onValueChange={(token) => onTokenSelect(token, oppositeToken, id)}
            />
            {inputToken.token && (
              <TokenAmountInputBalance
                balance={balance}
                onInput={({ value }) => onInputChange(value, id)}
                isLoading={isBalanceLoading}
              />
            )}
            {inputToken.token && !inputToken.token.isNative && isConnected ? (
              <AddErc20ToWalletButton evmCurrency={inputToken.token} />
            ) : (
              <div className="h-5" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
