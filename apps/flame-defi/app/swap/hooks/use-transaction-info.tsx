import type { Token } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { formatUnits } from "viem";

import {
  GetQuoteResult,
  TokenAmount,
  TokenInputState,
  TRADE_TYPE,
} from "@repo/flame-types";
import { getSlippageTolerance } from "@repo/ui/utils";
import { useGetQuote } from "features/evm-wallet";

import { TransactionInfo } from "../types";

// NOTE: When the tradeType is exactOut we must refetch the quote with exactIn because the
// quoteGas values are the values we display in top token input field.
// They are not the calculated output values we need

const useTransactionQuote = (
  inputOne: TokenInputState,
  inputTwo: TokenInputState,
) => {
  const { error, getQuote } = useGetQuote();
  const [quote, setQuote] = useState<GetQuoteResult | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  const fetchQuote = useCallback(async () => {
    setIsQuoteLoading(true);
    const quote = await getQuote(TRADE_TYPE.EXACT_IN, inputOne, inputTwo);
    if (quote) {
      setQuote(quote);
    }
    setIsQuoteLoading(false);
  }, [inputOne, inputTwo, getQuote]);

  return {
    quote,
    isQuoteLoading,
    fetchQuote,
    error,
  };
};

/**
 * Calculates the price impact
 * Returns the price impact as a decimal (e.g. -0.002 means -0.2%).
 */
const calculatePriceImpact = (quote: GetQuoteResult): number => {
  const hops = quote.route?.[0];

  if (!hops) {
    return 0;
  }
  // Aggregate the mid-price over all hops
  // Each hop’s mid-price is expressed as (tokenOut per tokenIn)
  let aggregatedMidPrice = 1;

  for (const hop of hops) {
    // Determine token0 and token1 by lexicographic ordering of addresses.
    let token0: Token, token1: Token;
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
    const numerator = JSBI.exponentiate(sqrtPriceX96, JSBI.BigInt(2));
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
  // - quote.amountDecimals: initial input amount
  // - quote.quoteDecimals: final output amount
  const overallInput = parseFloat(quote.amountDecimals);
  const overallOutput = parseFloat(quote.quoteDecimals);
  const overallExecutionPrice = overallOutput / overallInput;

  // Price impact is defined as:
  // - (executionPrice - midPrice) / midPrice
  const priceImpact =
    (overallExecutionPrice - aggregatedMidPrice) / aggregatedMidPrice;
  return priceImpact;
};

const calculateMinimumReceived = (
  data: GetQuoteResult,
  slippageTolerance: number,
): string => {
  if (!data.route[0] || !data.route[0][data.route[0].length - 1]) {
    return "0.00";
  }
  const outputToken = data.route[0][data.route[0].length - 1]?.tokenOut;

  if (!outputToken) {
    return "0.00";
  }

  const tokenAmount = new TokenAmount(outputToken, data.quoteGasAdjusted);
  const minimumReceived = tokenAmount.withSlippage(slippageTolerance, true).raw;

  return formatUnits(
    BigInt(minimumReceived.toString()),
    tokenAmount.token.decimals,
  );
};

export const useTransactionInfo = ({
  quote,
  token0,
  token1,
  tradeType,
  validSwapInputs,
}: {
  quote: GetQuoteResult | null;
  token0: TokenInputState;
  token1: TokenInputState;
  tradeType: TRADE_TYPE;
  validSwapInputs: boolean;
}): TransactionInfo => {
  const { formatNumber } = useIntl();
  const {
    quote: transactionQuote,
    isQuoteLoading: isQuoteLoading,
    fetchQuote,
  } = useTransactionQuote(token0, token1);
  const swapSlippageTolerance = getSlippageTolerance();

  useEffect(() => {
    if (tradeType === TRADE_TYPE.EXACT_OUT && validSwapInputs) {
      void fetchQuote();
    }
  }, [tradeType, fetchQuote, validSwapInputs]);

  const quoteData =
    tradeType === TRADE_TYPE.EXACT_IN ? quote : transactionQuote;
  const priceImpact = quoteData ? calculatePriceImpact(quoteData) : 0;

  // calculate and format the fee in the output token
  const frontendFeeEstimate =
    quoteData && token1.token
      ? formatNumber(
          parseFloat(
            formatUnits(
              BigInt(quoteData.quoteGasAdjusted || "0"),
              token1.token.coinDecimals,
            ),
          ) * 0.0025, // TODO - get fee percentage from config
          { minimumFractionDigits: 6, maximumFractionDigits: 6 },
        )
      : undefined;

  return {
    transactionQuoteDataLoading: isQuoteLoading,
    gasUseEstimateUSD: quoteData?.gasUseEstimateUSD || "0",
    formattedGasUseEstimateUSD: formatNumber(
      parseFloat(quoteData?.gasUseEstimateUSD || "0"),
      { minimumFractionDigits: 4, maximumFractionDigits: 4 },
    ),
    expectedOutputBigInt: BigInt(quoteData?.quoteGasAdjusted || "0"),
    expectedOutputFormatted: formatNumber(
      parseFloat(
        formatUnits(
          BigInt(quoteData?.quoteGasAdjusted || "0"),
          token1.token?.coinDecimals || 18,
        ),
      ),
      { minimumFractionDigits: 6, maximumFractionDigits: 6 },
    ),
    priceImpact:
      priceImpact !== 0
        ? `${formatNumber(priceImpact, { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "percent" })}`
        : "0.00",
    minimumReceived: quoteData
      ? formatNumber(
          parseFloat(
            calculateMinimumReceived(quoteData, swapSlippageTolerance),
          ),
          { minimumFractionDigits: 6, maximumFractionDigits: 6 },
        )
      : "0.00",
    frontendFeeEstimate,
  };
};
