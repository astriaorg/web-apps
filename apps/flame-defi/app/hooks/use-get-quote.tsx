import { useState, useCallback, useRef } from "react";
import { parseUnits } from "viem";
import { useEvmChainData } from "config";
import { GetQuoteResult, TokenInputState, TRADE_TYPE } from "@repo/flame-types";

export const useGetQuote = () => {
  const {
    selectedChain: { chainId, contracts: chainContracts },
  } = useEvmChainData();
  const [quote, setQuote] = useState<GetQuoteResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const getQuote = useCallback(
    async (
      type: TRADE_TYPE,
      topToken: TokenInputState,
      bottomToken: TokenInputState,
    ): Promise<GetQuoteResult | undefined> => {
      abortControllerRef.current = new AbortController();
      // can't swap between native and wrapped native tokens.
      if (
        (topToken.token?.isNative && bottomToken.token?.isWrappedNative) ||
        (topToken.token?.isWrappedNative && bottomToken.token?.isNative)
      ) {
        return;
      }
      // can't swap for the same token
      if (topToken.token?.equals(bottomToken.token)) {
        return;
      }
      const amount = topToken?.value
        ? parseUnits(
            topToken.value,
            topToken?.token?.coinDecimals || 18,
          ).toString()
        : "";

      // This is a fix for TIA not having a ERC20 contract address
      const tokenInAddress = topToken?.token?.isNative
        ? chainContracts?.wrappedNativeToken.address
        : topToken?.token?.erc20ContractAddress;
      const tokenInDecimals = topToken?.token?.coinDecimals;
      const tokenInSymbol = topToken?.token?.coinDenom.toLocaleLowerCase();

      const tokenOutAddress = bottomToken?.token?.isNative
        ? chainContracts?.wrappedNativeToken.address
        : bottomToken?.token?.erc20ContractAddress;
      const tokenOutDecimals = bottomToken?.token?.coinDecimals;
      const tokenOutSymbol = bottomToken?.token?.coinDenom.toLocaleLowerCase();

      if (
        !(
          chainId &&
          tokenInAddress &&
          tokenInDecimals !== undefined &&
          tokenInSymbol &&
          tokenOutAddress &&
          tokenOutDecimals !== undefined &&
          tokenOutSymbol &&
          amount &&
          parseFloat(amount) > 0 &&
          type
        )
      ) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const url =
          `https://us-west2-swap-routing-api-dev.cloudfunctions.net/get-quote?` +
          `chainId=${chainId}` +
          `&tokenInAddress=${tokenInAddress}` +
          `&tokenInDecimals=${tokenInDecimals}` +
          `&tokenInSymbol=${tokenInSymbol}` +
          `&tokenOutAddress=${tokenOutAddress}` +
          `&tokenOutDecimals=${tokenOutDecimals}` +
          `&tokenOutSymbol=${tokenOutSymbol}` +
          `&amount=${amount}` +
          `&type=${type}`;

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
    [chainId, chainContracts?.wrappedNativeToken.address],
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
