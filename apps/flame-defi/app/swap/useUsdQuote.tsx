import { TokenState } from "@repo/ui/types";
import { useConfig } from "config";
import { useGetQuote } from "./useGetQuote";
import { useEffect } from "react";
function useUsdQuote(token?: TokenState, quoteInput?: TokenState, isSelected?: boolean) {
  const { evmChains } = useConfig();
  const evmChainsData = Object.values(evmChains);
  const usdcToken = evmChainsData[0]?.currencies.find(currency => currency.coinDenom === "USDC");
  const { quote, loading, error, getQuote } = useGetQuote();
  const tokenValue = isSelected ? token?.value : quoteInput?.value;
  
  useEffect(() => {
    if (token && tokenValue) {
      getQuote("exactIn", {token: token.token, value: tokenValue || "" }, {token: usdcToken, value: ""});
    }
  }, [token, getQuote, usdcToken, tokenValue]);

  return {quote, loading, error}
}

export default useUsdQuote;