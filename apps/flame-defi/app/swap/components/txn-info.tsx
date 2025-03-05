"use client";

import { TokenState } from "@repo/flame-types";
import { InfoTooltip, Skeleton } from "@repo/ui/components";
import { GasIcon } from "@repo/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/shadcn-primitives";
import { formatDecimalValues, getSwapSlippageTolerance } from "@repo/ui/utils";
import { GetQuoteResult } from "@repo/flame-types";
import { useTxnInfo } from "../hooks";
import { OneToOneQuoteProps } from "./types";
import { RoutePath } from "./route-path";

enum TOKEN_INPUTS {
  TOKEN_ONE = "token_one",
  TOKEN_TWO = "token_two",
}

export interface TxnInfoProps {
  id: TOKEN_INPUTS;
  inputToken: TokenState;
  txnInfo: ReturnType<typeof useTxnInfo>;
}

export function TxnInfo({
  txnInfo,
  tokenOne,
  tokenTwo,
  oneToOneQuote,
  quote,
}: {
  txnInfo: ReturnType<typeof useTxnInfo>;
  tokenOne: TokenState;
  tokenTwo: TokenState;
  oneToOneQuote: OneToOneQuoteProps;
  quote: GetQuoteResult;
}) {
  const swapSlippageTolerance = getSwapSlippageTolerance();

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="transaction-details"
        className="text-grey-light text-sm border-b-0"
      >
        <div className="flex items-center justify-between pb-2">
          <Skeleton
            className="rounded-sm"
            isLoading={oneToOneQuote?.oneToOneLoading}
          >
            <div
              className="flex items-center cursor-pointer text-white font-medium gap-1"
              onClick={() =>
                oneToOneQuote?.setFlipDirection(!oneToOneQuote?.flipDirection)
              }
            >
              <div className="flex items-center gap-1">
                <span>{formatDecimalValues("1", 0)}</span>
                <span>{oneToOneQuote?.tokenOneSymbol}</span>
              </div>
              <div>=</div>
              <div className="flex items-center gap-1">
                <span>{oneToOneQuote?.tokenTwoValue}</span>
                <span>{oneToOneQuote?.tokenTwoSymbol}</span>
              </div>
            </div>
          </Skeleton>
          <Skeleton
            className="rounded-sm w-[100px] h-[25px] mt-3"
            isLoading={txnInfo.txnQuoteDataLoading}
          >
            <AccordionTrigger>
              {txnInfo.gasUseEstimateUSD && (
                <div className="[&>svg]:transform-none! flex items-center gap-1 width: 100%">
                  <GasIcon size={20} />
                  <span className="mr-1">
                    ${txnInfo.formattedGasUseEstimateUSD}
                  </span>
                </div>
              )}
            </AccordionTrigger>
          </Skeleton>
        </div>
        <AccordionContent>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="text-grey-light flex items-center gap-1">
                Expected Output{" "}
                <InfoTooltip
                  content="The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending."
                  side="right"
                  className="max-w-[250px]"
                />
              </span>
              <span className="text-grey-light">
                {txnInfo.expectedOutputFormatted}{" "}
                <span>{tokenTwo?.token?.coinDenom}</span>
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
              <span className="text-grey-light">{txnInfo.priceImpact}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-grey-light flex items-center gap-1">
                Network Fee{" "}
                <InfoTooltip
                  content="The network fee for the transaction."
                  side="right"
                />
              </span>
              <span className="text-grey-light">
                ${txnInfo.formattedGasUseEstimateUSD}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="text-grey-light flex items-center gap-1">
                Minimum received after slippage ({swapSlippageTolerance}
                %){" "}
                <InfoTooltip
                  className="max-w-[250px]"
                  content="The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will revert."
                  side="right"
                />
              </span>
              <span className="text-grey-light">
                {txnInfo.minimumReceived}{" "}
                <span>{tokenTwo?.token?.coinDenom}</span>
              </span>
            </p>
          </div>
          <div className="h-[1px] border border-border w-full my-4"></div>
          {quote && quote.route && (
            <RoutePath
              quoteRoute={quote.route}
              loading={txnInfo.txnQuoteDataLoading}
              symbolIn={tokenOne?.token?.coinDenom}
              symbolOut={tokenTwo?.token?.coinDenom}
              networkFee={txnInfo.formattedGasUseEstimateUSD}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
