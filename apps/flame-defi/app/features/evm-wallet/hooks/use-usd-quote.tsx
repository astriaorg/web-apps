import debounce from "lodash.debounce";
import { useEffect, useRef } from "react";

import { EvmCurrency, TokenInputState, TRADE_TYPE } from "@repo/flame-types";
import { useAstriaChainData } from "config";

import { useGetQuote } from "./use-get-quote";

export const useUsdQuote = (inputToken: TokenInputState) => {
  const { chain } = useAstriaChainData();
  const usdcToken = chain.currencies.find(
    (currency) => currency.coinDenom === "USDC",
  );
  const { quote, loading, quoteError, getQuote } = useGetQuote();

  const debouncedGetQuoteRef = useRef(
    debounce(
      (
        inputToken: Omit<TokenInputState, "isQuoteValue">,
        usdcToken: EvmCurrency,
      ) => {
        void getQuote(TRADE_TYPE.EXACT_IN, inputToken, {
          token: usdcToken,
          value: "",
        });
      },
      500,
    ),
  );

  useEffect(() => {
    if (inputToken.value !== "0" && usdcToken) {
      debouncedGetQuoteRef.current(inputToken, usdcToken);
    }
  }, [inputToken, usdcToken]);

  return { quote, loading, quoteError };
};
