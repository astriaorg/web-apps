import { GetQuoteResult, TokenState } from "@repo/ui/types";
import { QUOTE_TYPE } from "../constants";
import { parseUnits } from "viem";

export async function getQuote(
  type: string,
  chainId: number,
  tokenOne: TokenState,
  tokenTwo: TokenState,
  setQuote: React.Dispatch<React.SetStateAction<GetQuoteResult | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) {
  const token = type === QUOTE_TYPE.EXACT_IN ? tokenOne : tokenTwo;
  const amount = token?.value 
    ? parseUnits(token.value, token?.token?.coinDecimals || 18).toString() 
    : "";

  const tokenInAddress = tokenOne?.token?.erc20ContractAddress || "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071";
  const tokenInDecimals = tokenOne?.token?.coinDecimals;
  const tokenInSymbol = tokenOne?.token?.coinDenom.toLocaleLowerCase();
  const tokenOutAddress = tokenTwo?.token?.erc20ContractAddress || "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071";
  const tokenOutDecimals = tokenTwo?.token?.coinDecimals;
  const tokenOutSymbol = tokenTwo?.token?.coinDenom.toLocaleLowerCase();

  console.log({token, amount});

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
    } catch (err) {
      console.warn(err);
      setError("error message");
    } finally {
      setLoading(false);
    }
  }
}
