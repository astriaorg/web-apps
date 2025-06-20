import { useEffect, useMemo, useState } from "react";

import { EvmCurrency, GetQuoteResult, TRADE_TYPE } from "@repo/flame-types";
import { formatDecimalValues } from "@repo/ui/utils";
import { useGetQuote } from "features/evm-wallet";

export const useOneToOneQuote = (
  inputOne?: EvmCurrency,
  inputTwo?: EvmCurrency,
) => {
  const [flipDirection, setFlipDirection] = useState(true);
  const [quoteOne, setQuoteOne] = useState<GetQuoteResult | null>(null);
  const [quoteTwo, setQuoteTwo] = useState<GetQuoteResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const oneToOneValueTokens = useMemo(
    () => (flipDirection ? [inputOne, inputTwo] : [inputTwo, inputOne]),
    [flipDirection, inputOne, inputTwo],
  );

  const { error: quoteError, getQuote } = useGetQuote();
  const topTokenSymbol = oneToOneValueTokens[0]?.coinDenom;
  const bottomTokenSymbol = oneToOneValueTokens[1]?.coinDenom;
  const bottomTokenValue = flipDirection
    ? formatDecimalValues(quoteOne?.quoteDecimals, 6)
    : formatDecimalValues(quoteTwo?.quoteDecimals, 6);

  useEffect(() => {
    const fetchQuotes = async () => {
      setQuoteLoading(true);
      const quote1 = await getQuote(
        TRADE_TYPE.EXACT_IN,
        { token: inputOne, value: "1" },
        { token: inputTwo, value: "0" },
      );
      if (quote1) {
        setQuoteOne({ ...quote1 });
      }
      const quote2 = await getQuote(
        TRADE_TYPE.EXACT_IN,
        { token: inputTwo, value: "1" },
        { token: inputOne, value: "0" },
      );
      if (quote2) {
        setQuoteTwo({ ...quote2 });
      }
      setQuoteLoading(false);
    };

    fetchQuotes();
  }, [inputOne, inputTwo, getQuote]);

  return {
    topTokenSymbol,
    bottomTokenSymbol,
    bottomTokenValue,
    oneToOneLoading: quoteLoading,
    quoteError,
    setFlipDirection,
    flipDirection,
  };
};
