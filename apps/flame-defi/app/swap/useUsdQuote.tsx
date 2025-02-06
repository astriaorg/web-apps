import { TokenState } from "@repo/ui/types";
import { useEvmChainData } from "config";
import { useGetQuote } from "./useGetQuote";
import { useEffect } from "react";
import { QUOTE_TYPE } from "../constants";

function useUsdQuote(inputToken?: TokenState) {
  const { currencies } = useEvmChainData();
  const usdcToken = currencies?.find(currency => currency.coinDenom === "USDC");
  const { quote, loading, error, getQuote } = useGetQuote();
  
  useEffect(() => {
    if (inputToken && inputToken.value) {
      getQuote(QUOTE_TYPE.EXACT_IN, {token: inputToken.token, value: inputToken.value }, {token: usdcToken, value: ""});
    }
  }, [inputToken, getQuote, usdcToken]);

  return {quote, loading, error}
}

export default useUsdQuote;