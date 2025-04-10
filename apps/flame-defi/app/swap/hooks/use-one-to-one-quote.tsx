import { useState, useMemo, useEffect } from "react";
import { useGetQuote } from "features/evm-wallet";
import { EvmCurrency, GetQuoteResult, TRADE_TYPE } from "@repo/flame-types";
import { formatDecimalValues } from "@repo/ui/utils";

export const useOneToOneQuote = (
  inputOne: EvmCurrency | null,
  inputTwo: EvmCurrency | null,
) => {
  const [flipDirection, setFlipDirection] = useState(true);
  const [quoteOne, setQuoteOne] = useState<GetQuoteResult | null>(null);
  const [quoteTwo, setQuoteTwo] = useState<GetQuoteResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const oneToOneValueTokens = useMemo(
    () => (flipDirection ? [inputOne, inputTwo] : [inputTwo, inputOne]),
    [flipDirection, inputOne, inputTwo],
  );

  const { quoteError, getQuote } = useGetQuote();
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
