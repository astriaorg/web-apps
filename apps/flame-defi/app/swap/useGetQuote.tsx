import { GetQuoteResult, TokenState } from "@repo/ui/types";
import { useState, useEffect } from "react";
import { parseUnits } from "viem";

export interface GetQuoteParams {
  chainId?: number; // ChainId;
  tokenInAddress?: string;
  tokenInDecimals?: number;
  tokenInSymbol?: string;
  tokenOutAddress?: string;
  tokenOutDecimals?: number;
  tokenOutSymbol?: string;
  amount?: string;
  type: "exactIn" | "exactOut";
}

function useGetQuote(
  chainId?: number,
  primaryToken?: TokenState,
  secondToken?: TokenState,
) {
  const [quote, setQuote] = useState<GetQuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = primaryToken?.value
    ? parseUnits(
        primaryToken.value,
        primaryToken.token?.coinDecimals || 18,
      ).toString()
    : "";

  // TODO: This is temp fix for TIA/WTIA swap.
  const tokenInAddress =
    primaryToken?.token?.erc20ContractAddress ||
    "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071";
  const tokenInDecimals = primaryToken?.token?.coinDecimals;
  const tokenInSymbol = primaryToken?.token?.coinDenom.toLocaleLowerCase();
  const tokenOutAddress =
    secondToken?.token?.erc20ContractAddress ||
    "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071";
  const tokenOutDecimals = secondToken?.token?.coinDecimals;
  const tokenOutSymbol = secondToken?.token?.coinDenom.toLocaleLowerCase();
  const type = "exactIn";

  useEffect(() => {
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
      const fetchQuote = async () => {
        try {
          setLoading(true);
          setError(null);

          // Construct the URL
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
        } catch (err) {
          console.warn(err);
          // TODO: Add real error here later when type is known
          setError("error message");
        } finally {
          setLoading(false);
        }
      };

      fetchQuote();
    }
  }, [
    chainId,
    tokenInAddress,
    tokenInDecimals,
    tokenInSymbol,
    tokenOutAddress,
    tokenOutDecimals,
    tokenOutSymbol,
    amount,
    type,
  ]);

  return { quote, loading, error };
}

export default useGetQuote;
