import { useCallback, useRef, useState } from "react";
import { parseUnits } from "viem";
import { useConfig, useAstriaChainData } from "config";
import { GetQuoteResult, TokenInputState, TRADE_TYPE } from "@repo/flame-types";

export const useGetQuote = () => {
  const { swapQuoteAPIURL } = useConfig();
  const {
    chain: { chainId, contracts: chainContracts },
  } = useAstriaChainData();
  const [quote, setQuote] = useState<GetQuoteResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const getQuote = useCallback(
    async (
      tradeType: TRADE_TYPE,
      tokenIn: Omit<TokenInputState, "isQuoteValue">,
      tokenOut: Omit<TokenInputState, "isQuoteValue">,
    ): Promise<GetQuoteResult | undefined> => {
      abortControllerRef.current = new AbortController();
      // tokens must exist
      if (!tokenIn.token || !tokenOut.token) {
        return;
      }
      // can't swap between native and wrapped native tokens.
      if (
        (tokenIn.token.isNative && tokenOut.token.isWrappedNative) ||
        (tokenIn.token.isWrappedNative && tokenOut.token.isNative)
      ) {
        return;
      }
      // can't swap for the same token
      if (tokenIn.token.equals(tokenOut.token)) {
        return;
      }

      // get value from tokenIn or tokenOut based on tradeType
      const value =
        tradeType === TRADE_TYPE.EXACT_IN ? tokenIn.value : tokenOut.value;
      const valueDecimals =
        tradeType === TRADE_TYPE.EXACT_IN
          ? tokenIn.token.coinDecimals
          : tokenOut.token.coinDecimals;
      const amount = parseUnits(value, valueDecimals).toString();
      // must have value
      if (amount === "0") {
        return;
      }

      // NOTE - we need to use the address of the wrapped native token
      //  when getting quotes using the native currency
      const tokenInAddress = tokenIn.token.isNative
        ? chainContracts.wrappedNativeToken?.address
        : tokenIn.token.erc20ContractAddress;
      const tokenInDecimals = tokenIn.token.coinDecimals;
      // NOTE - this is an abuse of the fact that the swap-routing-api doesn't
      //  seem to use the symbol for the quote, or even check if the symbol
      //  matches the address supplied
      const tokenInSymbol = tokenIn.token.coinDenom.toLocaleLowerCase();

      const tokenOutAddress = tokenOut.token.isNative
        ? chainContracts.wrappedNativeToken?.address
        : tokenOut.token.erc20ContractAddress;
      const tokenOutDecimals = tokenOut.token.coinDecimals;
      const tokenOutSymbol = tokenOut.token.coinDenom.toLocaleLowerCase();

      try {
        setLoading(true);
        setError(null);

        const url =
          `${swapQuoteAPIURL}?` +
          `chainId=${chainId}` +
          `&tokenInAddress=${tokenInAddress}` +
          `&tokenInDecimals=${tokenInDecimals}` +
          `&tokenInSymbol=${tokenInSymbol}` +
          `&tokenOutAddress=${tokenOutAddress}` +
          `&tokenOutDecimals=${tokenOutDecimals}` +
          `&tokenOutSymbol=${tokenOutSymbol}` +
          `&amount=${amount}` +
          `&type=${tradeType}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const { data } = await response.json();
        setQuote({ ...data });

        return data;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.warn("Fetch aborted");
        } else {
          console.warn(err);
          setError("error fetching quote");
          throw err;
        }
      } finally {
        setLoading(false);
      }
    },
    [chainId, chainContracts.wrappedNativeToken?.address, swapQuoteAPIURL],
  );

  const cancelGetQuote = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    quote,
    loading,
    quoteError: error,
    getQuote,
    setQuote,
    cancelGetQuote,
  };
};
