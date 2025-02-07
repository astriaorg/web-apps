import { GetQuoteResult } from "@repo/flame-types";
import { formatDecimalValues } from "utils/utils";
import { formatUnits } from "viem";
import { TxnInfoProps } from "./components/TxnInfo";

function calculatePriceImpact(data: GetQuoteResult): string {
  const quoteValue = parseFloat(data.quoteDecimals);
  const quoteGasAdjustedValue = parseFloat(data.quoteGasAdjustedDecimals);

  const gasFee = quoteValue - quoteGasAdjustedValue;
  const priceImpact = (gasFee / quoteValue) * 100;
  return priceImpact.toFixed(2);
}

function calculateMinimumReceived(
  data: GetQuoteResult,
  slippageTolerance: number
): string {
  const adjustedQuote = parseFloat(data.quoteGasAdjustedDecimals);
  const minimumReceived = adjustedQuote * (1 - slippageTolerance);

  return formatDecimalValues(`${minimumReceived}`, 6);
}

  export function useTxnInfo({ swapPairs }: { swapPairs: TxnInfoProps[] }) {
    const inputTokenOne = swapPairs[0]?.inputToken
    const inputTokenTwo = swapPairs[1]?.inputToken
    const txnQuoteData = swapPairs[0]?.txnQuoteData

  return {
    gasUseEstimateUSD: txnQuoteData?.gasUseEstimateUSD,
    formattedGasUseEstimateUSD: formatDecimalValues(txnQuoteData?.gasUseEstimateUSD, 2),
    expectedOutputBigInt: BigInt(txnQuoteData?.quoteGasAdjusted || "0"),
    expectedOutputFormatted: formatDecimalValues(
      formatUnits(
        BigInt(txnQuoteData?.quoteGasAdjusted || "0"),
        inputTokenTwo?.token?.coinDecimals || 18
      ), 6
    ),
    priceImpact: txnQuoteData ? calculatePriceImpact(txnQuoteData) : '0.00',
    minimumReceived: txnQuoteData ? calculateMinimumReceived(txnQuoteData, 0.01) : '0.00',
    txnQuoteLoading: swapPairs[0]?.txnQuoteLoading,
    inputTokenOne,
    inputTokenTwo,
    txnQuoteData,
  }
}
