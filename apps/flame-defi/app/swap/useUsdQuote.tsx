import { useEffect } from "react";

import { useEvmChainData } from "config";
import { TokenState } from "@repo/flame-types";
import { useGetQuote } from "./useGetQuote";
import { QUOTE_TYPE } from "../constants";

function useUsdQuote(inputToken?: TokenState) {
  const { selectedChain } = useEvmChainData();
  const usdcToken = selectedChain.currencies?.find(
    (currency) => currency.coinDenom === "USDC",
  );
  const { quote, loading, error, getQuote } = useGetQuote();

  useEffect(() => {
    if (inputToken && inputToken.value) {
      getQuote(
        QUOTE_TYPE.EXACT_IN,
        { token: inputToken.token, value: inputToken.value },
        { token: usdcToken, value: "" },
      );
    }
  }, [inputToken, getQuote, usdcToken]);

  return { quote, loading, error };
}

export default useUsdQuote;
