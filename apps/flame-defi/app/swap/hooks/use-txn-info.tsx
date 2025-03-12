import {
  GetQuoteResult,
  TRADE_TYPE,
  Token,
  TokenAmount,
  TokenInputState,
} from "@repo/flame-types";
import { getSwapSlippageTolerance } from "@repo/ui/utils";
import JSBI from "jsbi";
import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { formatUnits } from "viem";
import { useGetQuote } from "../../hooks";

// NOTE: When the tradeType is exactOut we must refetch the quote with exactIn because the
// quoteGas values are the values we display in top token input field.
// They are not the calculated output values we need

const useTxnQuote = (inputOne: TokenInputState, inputTwo: TokenInputState) => {
  const { quoteError, getQuote } = useGetQuote();
  const [txnQuote, setTxnQuote] = useState<GetQuoteResult | null>(null);
  const [txnQuoteLoading, setTxnQuoteLoading] = useState(false);

  const fetchTxnQuote = useCallback(async () => {
    setTxnQuoteLoading(true);
    const txnQuoteData = await getQuote(
      TRADE_TYPE.EXACT_IN,
      inputOne,
      inputTwo,
    );
    if (txnQuoteData) {
      setTxnQuote(txnQuoteData);
    }
    setTxnQuoteLoading(false);
  }, [inputOne, inputTwo, getQuote]);

  return {
    txnQuote,
    txnQuoteLoading,
    fetchTxnQuote,
    quoteError,
  };
};

/**
 * Calculates the price impact
 * Returns the price impact as a decimal (e.g. -0.002 means -0.2%).
 */
const calculatePriceImpact = (txnQuoteData: GetQuoteResult): number => {
  const hops = txnQuoteData?.route?.[0];

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
  // - txnQuoteData.amountDecimals: initial input amount
  // - txnQuoteData.quoteDecimals: final output amount
  const overallInput = parseFloat(txnQuoteData.amountDecimals);
  const overallOutput = parseFloat(txnQuoteData.quoteDecimals);
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

export const useTxnInfo = ({
  quote,
  topToken,
  bottomToken,
  tradeType,
  validSwapInputs,
}: {
  quote: GetQuoteResult | null;
  topToken: TokenInputState;
  bottomToken: TokenInputState;
  tradeType: TRADE_TYPE;
  validSwapInputs: boolean;
}) => {
  const { formatNumber } = useIntl();
  const { txnQuote, txnQuoteLoading, fetchTxnQuote } = useTxnQuote(
    topToken,
    bottomToken,
  );
  const swapSlippageTolerance = getSwapSlippageTolerance();

  useEffect(() => {
    if (tradeType === TRADE_TYPE.EXACT_OUT && validSwapInputs) {
      void fetchTxnQuote();
    }
  }, [tradeType, fetchTxnQuote, validSwapInputs]);

  const txnQuoteData = tradeType === TRADE_TYPE.EXACT_IN ? quote : txnQuote;
  const priceImpact = txnQuoteData ? calculatePriceImpact(txnQuoteData) : 0;

  return {
    txnQuoteDataLoading: txnQuoteLoading,
    gasUseEstimateUSD: txnQuoteData?.gasUseEstimateUSD,
    formattedGasUseEstimateUSD: formatNumber(
      parseFloat(txnQuoteData?.gasUseEstimateUSD || "0"),
      { minimumFractionDigits: 4, maximumFractionDigits: 4 },
    ),
    expectedOutputBigInt: BigInt(txnQuoteData?.quoteGasAdjusted || "0"),
    expectedOutputFormatted: formatNumber(
      parseFloat(
        formatUnits(
          BigInt(txnQuoteData?.quoteGasAdjusted || "0"),
          bottomToken?.token?.coinDecimals || 18,
        ),
      ),
      { minimumFractionDigits: 6, maximumFractionDigits: 6 },
    ),
    priceImpact:
      priceImpact !== 0
        ? `${formatNumber(priceImpact, { minimumFractionDigits: 2, maximumFractionDigits: 2, style: "percent" })}`
        : "0.00",
    minimumReceived: txnQuoteData
      ? formatNumber(
          parseFloat(
            calculateMinimumReceived(txnQuoteData, swapSlippageTolerance),
          ),
          { minimumFractionDigits: 6, maximumFractionDigits: 6 },
        )
      : "0.00",
  };
};
