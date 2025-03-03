import { useEffect, useRef } from "react";
import debounce from "lodash.debounce";

import { useEvmChainData } from "config";
import { EvmCurrency, TokenState, TRADE_TYPE } from "@repo/flame-types";
import { useGetQuote } from "./use-get-quote";

export const useUsdQuote = (inputToken?: TokenState) => {
  const { selectedChain } = useEvmChainData();
  const usdcToken = selectedChain.currencies?.find(
    (currency) => currency.coinDenom === "USDC",
  );
  const { quote, loading, quoteError, getQuote } = useGetQuote();

  const debouncedGetQuoteRef = useRef(
    debounce(
      (
        tradeType: TRADE_TYPE,
        tokenData: { token: EvmCurrency; value: string },
        usdcToken: EvmCurrency,
      ) => {
        getQuote(tradeType, tokenData, { token: usdcToken, value: "" });
      },
      500,
    ),
  );

  useEffect(() => {
    if (inputToken && inputToken.token && inputToken.value && usdcToken) {
      debouncedGetQuoteRef.current(
        TRADE_TYPE.EXACT_IN,
        { token: inputToken.token, value: inputToken.value },
        usdcToken,
      );
    }
  }, [inputToken, usdcToken]);

  return { quote, loading, quoteError };
};
