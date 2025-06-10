"use client";

import { TokenInputState } from "@repo/flame-types";
import { GetQuoteResult } from "@repo/flame-types";
import { Skeleton } from "@repo/ui/components";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components";
import { FuelIcon } from "@repo/ui/icons";
import { TransactionInfoDetails } from "swap/components/transaction-info-details";
import { RoutePath } from "swap/modules/swap/components/route-path";
import {
  OneToOneQuoteProps,
  TransactionInfo as TransactionInfoType,
} from "swap/types";

export interface TransactionInfoProps {
  info: TransactionInfoType;
  token0: TokenInputState;
  token1: TokenInputState;
  oneToOneQuote: OneToOneQuoteProps;
  quote: GetQuoteResult;
}

export const TransactionInfo = ({
  info,
  token0,
  token1,
  oneToOneQuote,
  quote,
}: TransactionInfoProps) => {
  if (!token0.token || !token1.token) {
    return null;
  }

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="transaction-details"
        className="text-typography-subdued text-sm border-b-0"
      >
        <div className="flex items-center justify-between pb-2 mt-12">
          <Skeleton isLoading={oneToOneQuote.oneToOneLoading}>
            <div
              className="flex items-center cursor-pointer gap-1 font-semibold text-typography-default"
              onClick={() =>
                oneToOneQuote.setFlipDirection(!oneToOneQuote.flipDirection)
              }
            >
              <div className="flex items-center gap-1">
                <span>1</span>
                <span>{oneToOneQuote.topTokenSymbol}</span>
              </div>
              <div>=</div>
              <div className="flex items-center gap-1">
                <span>{oneToOneQuote.bottomTokenValue}</span>
                <span>{oneToOneQuote.bottomTokenSymbol}</span>
              </div>
            </div>
          </Skeleton>
          <Skeleton isLoading={info.transactionQuoteDataLoading}>
            <AccordionTrigger>
              {info.gasUseEstimateUSD && (
                <div className="flex items-center gap-1 font-semibold text-typography-default">
                  <FuelIcon size={20} />
                  <span className="ml-1">
                    ${info.formattedGasUseEstimateUSD}
                  </span>
                </div>
              )}
            </AccordionTrigger>
          </Skeleton>
        </div>
        <AccordionContent>
          <TransactionInfoDetails
            token={token1.token}
            fee={info.formattedGasUseEstimateUSD}
            amountOut={info.expectedOutputFormatted}
            amountMin={info.minimumReceived}
            priceImpact={info.priceImpact}
            frontendFeeEstimate={info.frontendFeeEstimate}
          />
          <hr className="border-t border-stroke-default my-5" />
          {quote && quote.route && (
            <RoutePath
              quoteRoute={quote.route}
              loading={info.transactionQuoteDataLoading}
              symbolIn={token0.token?.coinDenom}
              symbolOut={token1.token?.coinDenom}
              networkFee={info.formattedGasUseEstimateUSD}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
