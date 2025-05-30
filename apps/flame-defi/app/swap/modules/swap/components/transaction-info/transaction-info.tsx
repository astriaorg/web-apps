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
import { FuelIcon } from "@repo/ui/icons";
import { formatDecimalValues, getSlippageTolerance } from "@repo/ui/utils";
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

const TransactionInfoRow = ({
  left,
  right,
  tooltip,
}: {
  left: string;
  right: string;
  tooltip: string;
}) => {
  return (
    <p className="flex justify-between">
      <span className="text-typography-subdued flex items-center gap-1">
        {left}{" "}
        <InfoTooltip content={tooltip} side="right" className="max-w-[250px]" />
      </span>
      <span className="text-typography-subdued">{right}</span>
    </p>
  );
};

export const TransactionInfo = ({
  info,
  token0,
  token1,
  oneToOneQuote,
  quote,
}: TransactionInfoProps) => {
  const slippageTolerance = getSlippageTolerance();

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
          <Skeleton isLoading={info.transactionQuoteDataLoading}>
            <AccordionTrigger>
              {info.gasUseEstimateUSD && (
                <div className="flex items-center gap-1 font-semibold text-typography-default">
                  <FuelIcon size={20} />
                  <span className="mr-1">
                    ${info.formattedGasUseEstimateUSD}
                  </span>
                </div>
              )}
            </AccordionTrigger>
          </Skeleton>
        </div>
        <AccordionContent>
          <div className="space-y-2">
            <TransactionInfoRow
              left="Expected Output"
              right={`${info.expectedOutputFormatted} ${token1.token?.coinDenom}`}
              tooltip="The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending."
            />
            <TransactionInfoRow
              left="Price Impact"
              right={info.priceImpact}
              tooltip="The impact your trade has on the market price of this pool."
            />
            <TransactionInfoRow
              left="Network Fee"
              right={`$${info.formattedGasUseEstimateUSD}`}
              tooltip="The network fee for the transaction."
            />
            {Boolean(info.frontendFeeEstimate) && (
              <TransactionInfoRow
                // TODO: Show fee percentage from config.
                left="Fee (0.25%)"
                right={`${info.frontendFeeEstimate} ${token1.token?.coinDenom}`}
                tooltip="Fees are applied to ensure the best experience on Flame, and have already been factored into this quote."
              />
            )}
            <TransactionInfoRow
              left={`Min Received After Slippage (${slippageTolerance}%)`}
              right={`${info.minimumReceived} ${token1.token?.coinDenom}`}
              tooltip="The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will revert."
            />
          </div>
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
