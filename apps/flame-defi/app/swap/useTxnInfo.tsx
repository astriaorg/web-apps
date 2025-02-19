import {
  GetQuoteResult,
  TRADE_TYPE,
  TokenInRoute,
  TokenState,
} from "@repo/flame-types";
import {
  formatNumberAsPercent,
  formatDecimalValues,
  getSwapSlippageTolerance,
} from "@repo/ui/utils";
import { formatUnits } from "viem";
import JSBI from "jsbi";
import { useState, useCallback, useEffect } from "react";
import { useGetQuote } from "./useGetQuote";

function useExactInQuote(inputOne: TokenState, inputTwo: TokenState) {
  const { error, getQuote } = useGetQuote();
  const [exactInQuote, setExactInQuote] = useState<GetQuoteResult | null>(null);
  const [exactInQuoteLoading, setExactInQuoteLoading] = useState(false);

  const fetchExactInQuote = useCallback(async () => {
    setExactInQuoteLoading(true);
    const exactInQuoteData = await getQuote(
      TRADE_TYPE.EXACT_IN,
      inputOne,
      inputTwo,
    );
    if (exactInQuoteData) {
      setExactInQuote({ ...exactInQuoteData });
    }
    setExactInQuoteLoading(false);
  }, [inputOne, inputTwo, getQuote]);

  return {
    exactInQuote,
    exactInQuoteLoading,
    fetchExactInQuote,
    error,
  };
}

/**
 * Calculates the price impact
 * Returns the price impact as a decimal (e.g. -0.002 means -0.2%).
 */
export function calculatePriceImpact(
  txnQuoteData: GetQuoteResult | null | undefined,
): number {
  const hops = txnQuoteData?.route?.[0];

  if (!hops) {
    return 0;
  }
  // Aggregate the mid-price over all hops
  // Each hop’s mid-price is expressed as (tokenOut per tokenIn)
  let aggregatedMidPrice = 1;

  for (const hop of hops) {
    // Determine token0 and token1 by lexicographic ordering of addresses.
    let token0: TokenInRoute, token1: TokenInRoute;
    if (
      hop.tokenIn.address.toLowerCase() < hop.tokenOut.address.toLowerCase()
    ) {
      token0 = hop.tokenIn;
      token1 = hop.tokenOut;
    } else {
      token0 = hop.tokenOut;
      token1 = hop.tokenIn;
    }

    // Compute the raw price from sqrtPriceX96:
    // - rawPrice = (sqrtPriceX96 / 2^96)^2 = (sqrtPriceX96^2) / 2^192.
    const sqrtPriceX96 = JSBI.BigInt(hop.sqrtRatioX96);
    const numerator = JSBI.multiply(sqrtPriceX96, sqrtPriceX96);
    const denominator = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(192));
    const rawPrice =
      Number(numerator.toString()) / Number(denominator.toString());

    // Adjust for token decimals
    // This rawPrice gives a value in terms of token1 per token0
    // so we adjust it by: 10^(token0.decimals - token1.decimals)
    const midPriceToken1PerToken0 =
      rawPrice * Math.pow(10, token0.decimals - token1.decimals);

    // Decide whether to invert the price so that we always express it as (tokenOut per tokenIn):
    // - If the hop's input token is token0, then mid-price is already token1 per token0.
    // - If the hop's input token is token1, invert it.
    let hopMidPrice: number;
    if (hop.tokenIn.address.toLowerCase() === token0.address.toLowerCase()) {
      hopMidPrice = midPriceToken1PerToken0;
    } else {
      hopMidPrice = 1 / midPriceToken1PerToken0;
    }

    aggregatedMidPrice *= hopMidPrice;
  }

  // Compute the overall execution price:
  // - txnQuoteData.amountDecimals: initial input amount
  // - txnQuoteData.quoteDecimals: final output amount
  const overallInput = parseFloat(txnQuoteData?.amountDecimals);
  const overallOutput = parseFloat(txnQuoteData?.quoteDecimals);
  const overallExecutionPrice = overallOutput / overallInput;

  // Price impact is defined as:
  // - (executionPrice - midPrice) / midPrice
  const priceImpact =
    (overallExecutionPrice - aggregatedMidPrice) / aggregatedMidPrice;
  return priceImpact;
}

function calculateMinimumReceived(
  data: GetQuoteResult,
  slippageTolerance: number,
): string {
  const adjustedQuote = parseFloat(data.quoteGasAdjustedDecimals);
  const minimumReceived = adjustedQuote * (1 - slippageTolerance);

  return formatDecimalValues(`${minimumReceived}`, 6);
}

export function useTxnInfo({
  quote,
  tokenOne,
  tokenTwo,
  tradeType,
  validSwapInputs,
}: {
  quote: GetQuoteResult | null;
  tokenOne: TokenState;
  tokenTwo: TokenState;
  tradeType: TRADE_TYPE;
  validSwapInputs: boolean;
}) {
  const { exactInQuote, exactInQuoteLoading, fetchExactInQuote } =
    useExactInQuote(tokenOne, tokenTwo);
  const swapSlippageTolerance = getSwapSlippageTolerance();

  useEffect(() => {
    if (tradeType === TRADE_TYPE.EXACT_OUT && validSwapInputs) {
      fetchExactInQuote();
    }
  }, [tradeType, fetchExactInQuote, validSwapInputs]);

  const txnQuoteData = tradeType === TRADE_TYPE.EXACT_IN ? quote : exactInQuote;
  const priceImpact = calculatePriceImpact(txnQuoteData);

  return {
    txnQuoteDataLoading: exactInQuoteLoading,
    gasUseEstimateUSD: txnQuoteData?.gasUseEstimateUSD,
    formattedGasUseEstimateUSD: formatDecimalValues(
      txnQuoteData?.gasUseEstimateUSD,
      4,
    ),
    expectedOutputBigInt: BigInt(txnQuoteData?.quoteGasAdjusted || "0"),
    expectedOutputFormatted: formatDecimalValues(
      formatUnits(
        BigInt(txnQuoteData?.quoteGasAdjusted || "0"),
        tokenTwo?.token?.coinDecimals || 18,
      ),
      6,
    ),
    priceImpact:
      priceImpact !== 0
        ? `${formatNumberAsPercent(priceImpact * 100)}`
        : "0.00",
    minimumReceived: txnQuoteData
      ? calculateMinimumReceived(txnQuoteData, swapSlippageTolerance)
      : "0.00",
  };
}
