import { useEffect, useRef } from "react";
import debounce from "lodash.debounce";

import { useEvmChainData } from "config";
import { EvmCurrency, TokenInputState, TRADE_TYPE } from "@repo/flame-types";
import { useGetQuote } from "../../hooks";

export const useUsdQuote = (inputToken: TokenInputState) => {
  const { selectedChain } = useEvmChainData();
  const usdcToken = selectedChain.currencies.find(
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
