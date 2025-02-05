import { useState, useCallback } from "react";
import { GetQuoteResult, TokenState } from "@repo/ui/types";
import { QUOTE_TYPE } from "../constants";
import { parseUnits } from "viem";
import { useConfig } from "config";
import { isTiaWtiaSwapPair } from "./page";

export function useGetQuote() {
  const { evmChains } = useConfig();
  const evmChainsData = Object.values(evmChains);
  const chainId = evmChainsData[0]?.chainId || 0;
  const [quote, setQuote] = useState<GetQuoteResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getQuote = useCallback(
    async (
      type: string,
      tokenOne: TokenState,
      tokenTwo: TokenState
    ) => {
      const isTiaWtia = isTiaWtiaSwapPair(tokenOne, tokenTwo);
      if (isTiaWtia) {
        return;
      }
      const token = type === QUOTE_TYPE.EXACT_IN ? tokenOne : tokenTwo;
      const amount = token?.value
        ? parseUnits(token.value, token?.token?.coinDecimals || 18).toString()
        : "";

      const tokenInAddress =
        tokenOne?.token?.erc20ContractAddress ||
        "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071";
      const tokenInDecimals = tokenOne?.token?.coinDecimals;
      const tokenInSymbol = tokenOne?.token?.coinDenom.toLocaleLowerCase();
      const tokenOutAddress =
        tokenTwo?.token?.erc20ContractAddress ||
        "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071";
      const tokenOutDecimals = tokenTwo?.token?.coinDecimals;
      const tokenOutSymbol = tokenTwo?.token?.coinDenom.toLocaleLowerCase();

      if (
        chainId &&
        tokenInAddress &&
        tokenInDecimals !== undefined &&
        tokenInSymbol &&
        tokenOutAddress &&
        tokenOutDecimals !== undefined &&
        tokenOutSymbol &&
        amount &&
        type
      ) {
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
          });

          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }

          const { data } = await response.json();
          setQuote({ ...data });
          return data;
        } catch (err) {
          console.warn(err);
          setError("error message");
        } finally {
          setLoading(false);
        }
      }
    },
    [chainId]
  );

  return { quote, loading, error, getQuote };
}
