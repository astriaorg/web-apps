"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/shadcn-primitives";
import { InfoTooltip } from "@repo/ui/components";
import { GasIcon } from "@repo/ui/icons";
import { formatDecimalValues } from "utils/utils";
import { TokenState, GetQuoteResult } from "@repo/ui/types";
import useOneToOneQuote from "swap/useOneToOneQuote";
import { TOKEN_INPUTS } from "../../constants";
import { useTxnInfo } from "swap/useTxnInfo";

export interface TxnInfoProps {
  id: TOKEN_INPUTS;
  inputToken: TokenState;
  txnQuoteData: GetQuoteResult | null;
  txnQuoteLoading: boolean;
  txnQuoteError: string | null;
}

export function TxnInfo({ swapPairs }: { swapPairs: TxnInfoProps[] }) {
  const inputTokenOne = swapPairs[0]?.inputToken
  const inputTokenTwo = swapPairs[1]?.inputToken
  const {gasUseEstimateUSD, formattedGasUseEstimateUSD, expectedOutputFormatted, priceImpact, minimumReceived} = useTxnInfo({ swapPairs });
  const { tokenOneSymbol, tokenTwoSymbol, tokenTwoValue, oneToOneLoading, error, setFlipDirection, flipDirection } = useOneToOneQuote(inputTokenOne, inputTokenTwo);

  if (swapPairs[0]?.txnQuoteLoading) {
    return <div></div>;
  }

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="transaction-details"
        className="text-grey-light text-sm border-b-0"
      >
        <div className="flex items-center justify-between">
          <div
            className="flex items-center cursor-pointer text-white font-medium gap-1"
            onClick={() => setFlipDirection(!flipDirection)}
          >
            <div className="flex items-center gap-1">
              <span>{formatDecimalValues("1", 0)}</span>
              <span>{tokenOneSymbol}</span>
            </div>
            <div>=</div>
            <div className="flex items-center gap-1">
              {oneToOneLoading ? (
                <span>loading...</span>
              ) : (
                <>
                  <span>{tokenTwoValue}</span>
                  <span>{tokenTwoSymbol}</span>
                </>
              )}
            </div>
          </div>
          <AccordionTrigger>
            {gasUseEstimateUSD && (
              <div className="[&>svg]:!transform-none flex items-center gap-1 width: 100%">
                <GasIcon size={20} />
                <span className="mr-1">${formattedGasUseEstimateUSD}</span>
              </div>
            )}
          </AccordionTrigger>
        </div>
        <AccordionContent>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="text-grey-light flex items-center gap-1">
                Expected Output{" "}
                <InfoTooltip
                  content="The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending."
                  side="right"
                />
              </span>
              <span className="text-grey-light">
                {expectedOutputFormatted} <span>{inputTokenTwo?.token?.coinDenom}</span>
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-grey-light flex items-center gap-1">
                Price Impact{" "}
                <InfoTooltip
                  content="The impact your trade has on the market price of this pool."
                  side="right"
                />
              </span>
              <span className="text-grey-light">{priceImpact}%</span>
            </p>
            <p className="flex justify-between">
              <span className="text-grey-light flex items-center gap-1">
                Minimum received after slippage (0.10%){" "}
                <InfoTooltip
                  content="The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will revert."
                  side="right"
                />
              </span>
              <span className="text-grey-light">
                {minimumReceived} <span>{inputTokenTwo?.token?.coinDenom}</span>
              </span>
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
