"use client";

import { TransactionFailedProps, TransactionStatus } from "@repo/flame-types";
import {
  BlockLoader,
  InfoTooltip,
  Skeleton,
  SuccessCheck,
} from "@repo/ui/components";
import { ArrowDownIcon, ErrorIcon } from "@repo/ui/icons";
import { formatDecimalValues, getSlippageTolerance } from "@repo/ui/utils";
import { useAstriaChainData } from "config";
import {
  SwapTransactionStepsProps,
  TransactionDetailsProps,
  TransactionStepsProps,
} from "swap/types";

export function TransactionDetails({
  token0,
  token1,
  expectedOutputFormatted,
  priceImpact,
  minimumReceived,
  oneToOneQuote,
  isQuoteLoading,
  frontendFeeEstimate,
}: TransactionDetailsProps) {
  const {
    topTokenSymbol,
    bottomTokenSymbol,
    bottomTokenValue,
    oneToOneLoading,
    setFlipDirection,
    flipDirection,
  } = oneToOneQuote;
  const slippageTolerance = getSlippageTolerance();

  return (
    <>
      <div className="flex flex-col items-center gap-3 mb-8 mt-6 relative">
        <Skeleton className="rounded-sm w-full" isLoading={isQuoteLoading}>
          <div className="flex justify-between bg-semi-white border border-solid border-grey-medium p-4 rounded-xl w-full text-lg">
            <span>{formatDecimalValues(token0.value || "0", 6)}</span>
            <span className="flex items-center gap-1">
              {token0.token?.IconComponent &&
                token0.token.IconComponent({ size: 24 })}
              {token0.token?.coinDenom}
            </span>
          </div>
        </Skeleton>
        <Skeleton className="rounded-sm w-full" isLoading={isQuoteLoading}>
          <div className="flex justify-between bg-semi-white border border-solid border-grey-medium p-4 rounded-xl text-md w-full text-lg">
            <span>{expectedOutputFormatted}</span>
            <span className="flex items-center gap-1">
              {token1.token?.IconComponent &&
                token1.token.IconComponent({ size: 24 })}
              {token1.token?.coinDenom}
            </span>
          </div>
        </Skeleton>
        <div className="absolute top-1/2 transform -translate-y-1/2 flex justify-center">
          <div className="z-10 p-1 bg-grey-dark rounded-xl border-4 border-black">
            <ArrowDownIcon aria-label="Swap" size={20} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="rounded-sm" isLoading={oneToOneLoading}>
          <div
            className="flex items-center cursor-pointer text-white font-medium gap-1"
            onClick={() => setFlipDirection(!flipDirection)}
          >
            <div className="flex items-center gap-1">
              <span>{formatDecimalValues("1", 0)}</span>
              <span>{topTokenSymbol}</span>
            </div>
            <div>=</div>
            <div className="flex items-center gap-1">
              <span>{bottomTokenValue}</span>
              <span>{bottomTokenSymbol}</span>
            </div>
          </div>
        </Skeleton>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-grey-light flex items-center text-sm gap-1">
            Expected Output{" "}
            <InfoTooltip
              className="max-w-[250px]"
              content="The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending."
              side="right"
            />
          </span>
          <span className="text-grey-light text-sm font-medium">
            {expectedOutputFormatted} <span>{token1.token?.coinDenom}</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-grey-light flex items-center text-sm gap-1">
            Price Impact{" "}
            <InfoTooltip
              content="The impact your trade has on the market price of this pool."
              side="right"
            />
          </span>
          <span className="text-grey-light text-sm font-medium">
            {priceImpact}
          </span>
        </div>
        {Boolean(frontendFeeEstimate) && (
          <div className="flex justify-between">
            <span className="text-grey-light flex items-center text-sm gap-1">
              {/* TODO - show fee percentage from config */}
              Fee (0.25%){" "}
              <InfoTooltip
                content="Fees are applied to ensure the best experience on Flame, and have already been factored into this quote."
                side="right"
              />
            </span>
            <span className="text-grey-light text-sm font-medium">
              {frontendFeeEstimate} <span>{token1.token?.coinDenom}</span>
            </span>
          </div>
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
          <div className="text-grey-light flex items-center gap-1 text-sm font-medium">
            <span>{minimumReceived}</span>
            <span>{token1.token?.coinDenom}</span>
          </div>
        </div>
      </div>
    </>
  );
}

function TransactionLoader({
  expectedOutputFormatted,
  token0: topToken,
  token1: bottomToken,
  isTiaWtia,
}: TransactionStepsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full mt-20">
      <BlockLoader className="mb-20" />
      <div className="text-white font-medium mt-6 text-center">
        <span className="text-base md:text-lg mb-2">
          Confirm Transaction in wallet
        </span>
        <div className="flex items-center gap-1 justify-center text-sm md:text-base">
          <span>
            {formatDecimalValues(topToken.value || "0", 6)}{" "}
            <span>{topToken.token?.coinDenom}</span>
          </span>
          <span>for</span>
          <span>
            {isTiaWtia
              ? formatDecimalValues(bottomToken.value || "0", 6)
              : expectedOutputFormatted}{" "}
            <span> {bottomToken.token?.coinDenom}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function TransactionSuccess({
  token0,
  token1,
  expectedOutputFormatted,
  isTiaWtia,
  hash,
}: TransactionStepsProps) {
  const { chain } = useAstriaChainData();
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <SuccessCheck />
      <div className="text-white font-medium mt-6 mb-6 text-center w-full">
        <span className="mb-2 text-base md:text-lg">Success!</span>
        <div className="flex flex-col md:flex-row items-center gap-1 justify-center text-sm md:text-base">
          <div className="flex items-center gap-1">
            <span>Swapped</span>
            <span>
              {formatDecimalValues(token0.value || "0", 6)}{" "}
              <span>{token0.token?.coinDenom}</span>
            </span>
          </div>
          <span>for</span>
          <div className="flex items-center gap-1">
            {isTiaWtia
              ? formatDecimalValues(token1.value || "0", 6)
              : expectedOutputFormatted}{" "}
            <span>{token1.token?.coinDenom}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 justify-center text-base">
          <a
            href={`${chain.blockExplorerUrl}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-orange hover:text-orange/80  transition text-base md:text-lg underline"
          >
            View on Explorer
          </a>
        </div>
      </div>
    </div>
  );
}

function TransactionFailed({ message }: TransactionFailedProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <ErrorIcon size={170} className="text-orange-soft" />
      <div className="text-white font-medium mt-6 text-center">
        <div className="flex items-center gap-1 justify-center text-base">
          <span>{message || "An error occurred."}</span>
        </div>
      </div>
    </div>
  );
}

export function SwapTransactionSteps({
  status,
  info,
  token0,
  token1,
  isTiaWtia,
  hash,
  message,
  oneToOneQuote,
  isQuoteLoading,
}: SwapTransactionStepsProps) {
  return (
    <div className="h-[320px]">
      {status === TransactionStatus.IDLE && !isTiaWtia && (
        <TransactionDetails
          token0={token0}
          token1={token1}
          expectedOutputFormatted={info.expectedOutputFormatted}
          priceImpact={info.priceImpact}
          minimumReceived={info.minimumReceived}
          isTiaWtia={isTiaWtia}
          oneToOneQuote={oneToOneQuote}
          isQuoteLoading={isQuoteLoading}
          frontendFeeEstimate={info.frontendFeeEstimate}
        />
      )}
      {status === TransactionStatus.PENDING && (
        <TransactionLoader
          token0={token0}
          token1={token1}
          expectedOutputFormatted={info.expectedOutputFormatted}
          isTiaWtia={isTiaWtia}
        />
      )}
      {status === TransactionStatus.SUCCESS && (
        <TransactionSuccess
          token0={token0}
          token1={token1}
          expectedOutputFormatted={info.expectedOutputFormatted}
          isTiaWtia={isTiaWtia}
          hash={hash}
        />
      )}
      {status === TransactionStatus.FAILED && (
        <TransactionFailed message={message} />
      )}
    </div>
  );
}
