"use client";

import { TokenInputState } from "@repo/flame-types";
import { GetQuoteResult } from "@repo/flame-types";
import { InfoTooltip, Skeleton } from "@repo/ui/components";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components";
import { GasIcon } from "@repo/ui/icons";
import { formatDecimalValues, getSlippageTolerance } from "@repo/ui/utils";

import { OneToOneQuoteProps, TransactionInfo } from "../types";
import { RoutePath } from "./route-path";

export interface TxnInfoProps {
  txnInfo: TransactionInfo;
  topToken: TokenInputState;
  bottomToken: TokenInputState;
  oneToOneQuote: OneToOneQuoteProps;
  quote: GetQuoteResult;
}

export function TxnInfo({
  txnInfo,
  topToken,
  bottomToken,
  oneToOneQuote,
  quote,
}: TxnInfoProps) {
  const slippageTolerance = getSlippageTolerance();

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="transaction-details"
        className="text-grey-light text-sm border-b-0"
      >
        <div className="flex items-center justify-between pb-2">
          <Skeleton
            className="rounded-sm"
            isLoading={oneToOneQuote.oneToOneLoading}
          >
            <div
              className="flex items-center cursor-pointer text-white font-medium gap-1"
              onClick={() =>
                oneToOneQuote.setFlipDirection(!oneToOneQuote.flipDirection)
              }
            >
              <div className="flex items-center gap-1">
                <span>{formatDecimalValues("1", 0)}</span>
                <span>{oneToOneQuote.topTokenSymbol}</span>
              </div>
              <div>=</div>
              <div className="flex items-center gap-1">
                <span>{oneToOneQuote.bottomTokenValue}</span>
                <span>{oneToOneQuote.bottomTokenSymbol}</span>
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
                <span>{bottomToken.token?.coinDenom}</span>
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
            {Boolean(txnInfo.frontendFeeEstimate) && (
              <p className="flex justify-between">
                <span className="text-grey-light flex items-center gap-1">
                  {/* TODO - show fee percentage from config */}
                  Fee (0.25%){" "}
                  <InfoTooltip
                    content="Fees are applied to ensure the best experience on Flame, and have already been factored into this quote."
                    side="right"
                  />
                </span>
                <span className="text-grey-light">
                  {txnInfo.frontendFeeEstimate}{" "}
                  <span>{bottomToken.token?.coinDenom}</span>
                </span>
              </p>
            )}
            <div className="flex justify-between">
              <div className="flex gap-1 items-center">
                <span className="w-[116px] md:w-full text-sm text-grey-light">
                  Min received after slippage ({slippageTolerance}%)
                </span>
                <InfoTooltip
                  className="max-w-[250px]"
                  content="The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will revert."
                  side="right"
                />
              </div>
              <span className="text-grey-light">
                {txnInfo.minimumReceived}{" "}
                <span>{bottomToken.token?.coinDenom}</span>
              </span>
            </div>
          </div>
          <div className="h-[1px] border border-border w-full my-4"></div>
          {quote && quote.route && (
            <RoutePath
              quoteRoute={quote.route}
              loading={txnInfo.txnQuoteDataLoading}
              symbolIn={topToken.token?.coinDenom}
              symbolOut={bottomToken.token?.coinDenom}
              networkFee={txnInfo.formattedGasUseEstimateUSD}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
