"use client";

import { InfoTooltip, BlockLoader, SuccessCheck } from "@repo/ui/components";
import { formatDecimalValues, getSlippageTolerance } from "utils/utils";
import { OneToOneQuoteProps, TokenState } from "@repo/flame-types";
import { ArrowDownIcon, ErrorIcon } from "@repo/ui/icons";
import { flameExplorerUrl, TXN_STATUS } from "../../constants";
import { TxnInfoProps } from "./TxnInfo";
import { useTxnInfo } from "../useTxnInfo";
import { Skeleton } from "@repo/ui/shadcn-primitives";

interface TxnStepsProps {
  expectedOutputFormatted: string | undefined;
  inputOne: TokenState | undefined;
  inputTwo: TokenState | undefined;
  isTiaWtia: boolean;
  txnHash?: `0x${string}` | undefined;
  txnMsg?: string | undefined;
}

interface TxnDetailsProps extends TxnStepsProps {
  priceImpact: string | undefined;
  minimumReceived: string | undefined;
  oneToOneQuote: OneToOneQuoteProps;
}

interface SwapTxnStepsProps {
  swapPairs: TxnInfoProps[];
  txnStatus: TXN_STATUS | undefined;
  txnHash: `0x${string}` | undefined;
  txnMsg: string | undefined;
  isTiaWtia: boolean;
  oneToOneQuote: OneToOneQuoteProps;
}

export function TxnDetails({
  inputOne,
  inputTwo,
  expectedOutputFormatted,
  priceImpact,
  minimumReceived,
  oneToOneQuote,
}: TxnDetailsProps) {
  const {
    tokenOneSymbol,
    tokenTwoSymbol,
    tokenTwoValue,
    oneToOneLoading,
    // error,
    setFlipDirection,
    flipDirection,
  } = oneToOneQuote;
  const slippageTolerance = getSlippageTolerance();

  return (
    <>
      <div className="flex flex-col items-center gap-3 mb-8 mt-6 relative">
        <div className="flex justify-between bg-semi-white border border-solid border-grey-medium p-4 rounded-xl w-full text-lg">
          <span>{formatDecimalValues(inputOne?.value || "0", 6)}</span>
          <span className="flex items-center gap-1">
            {inputOne?.token?.IconComponent &&
              inputOne?.token?.IconComponent({ size: 24 })}
            {inputOne?.token?.coinDenom}
          </span>
        </div>
        <div className="flex justify-between bg-semi-white border border-solid border-grey-medium p-4 rounded-xl text-md w-full text-lg">
          <span>{expectedOutputFormatted}</span>
          <span className="flex items-center gap-1">
            {inputTwo?.token?.IconComponent &&
              inputTwo?.token?.IconComponent({ size: 24 })}
            {inputTwo?.token?.coinDenom}
          </span>
        </div>
        <div className="absolute top-1/2 transform -translate-y-1/2 flex justify-center">
          <div className="z-10 p-1 bg-grey-dark rounded-xl border-4 border-black">
            <ArrowDownIcon aria-label="Swap" size={20} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="rounded" isLoading={oneToOneLoading}>
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
              <span>{tokenTwoValue}</span>
              <span>{tokenTwoSymbol}</span>
            </div>
          </div>
        </Skeleton>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-grey-light flex items-center text-sm gap-1">
            Expected Output{" "}
            <InfoTooltip
              content="The amount you expect to receive at the current market price. You may receive less or more if the market price changes while your transaction is pending."
              side="right"
            />
          </span>
          <span className="text-grey-light text-sm font-medium">
            {expectedOutputFormatted} <span>{inputTwo?.token?.coinDenom}</span>
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
            {priceImpact}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-grey-light flex items-center text-sm gap-1">
            Minimum received after slippage ({slippageTolerance}%){" "}
            <InfoTooltip
              content="The minimum amount you are guaranteed to receive. If the price slips any further, your transaction will revert."
              side="right"
            />
          </span>
          <span className="text-grey-light text-sm font-medium">
            {minimumReceived} <span>{inputTwo?.token?.coinDenom}</span>
          </span>
        </div>
      </div>
    </>
  );
}

function TxnLoader({
  expectedOutputFormatted,
  inputOne,
  inputTwo,
  isTiaWtia,
}: TxnStepsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full mt-20">
      <BlockLoader className="mb-20" />
      <div className="text-white font-medium mt-6 text-center">
        <span className="text-lg mb-2">Confirm Transaction in wallet</span>
        <div className="flex items-center gap-1 justify-center text-sm">
          <span>
            {formatDecimalValues(inputOne?.value || "0", 6)}{" "}
            <span>{inputOne?.token?.coinDenom}</span>
          </span>
          <span>for</span>
          <span>
            {isTiaWtia
              ? formatDecimalValues(inputTwo?.value || "0", 6)
              : expectedOutputFormatted}{" "}
            <span> {inputTwo?.token?.coinDenom}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function TxnSuccess({
  expectedOutputFormatted,
  inputOne,
  inputTwo,
  isTiaWtia,
  txnHash,
}: TxnStepsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <SuccessCheck />
      <div className="text-white font-medium mt-6 text-center">
        <span className="text-lg mb-2">Success</span>
        <div className="flex items-center gap-1 justify-center text-base">
          <span>Swapped</span>
          <span>
            {formatDecimalValues(inputOne?.value || "0", 6)}{" "}
            <span>{inputOne?.token?.coinDenom}</span>
          </span>
          <span>for</span>
          <span>
            {isTiaWtia
              ? formatDecimalValues(inputTwo?.value || "0", 6)
              : expectedOutputFormatted}{" "}
            <span> {inputTwo?.token?.coinDenom}</span>
          </span>
        </div>
        <div className="flex items-center gap-1 justify-center text-base">
          <a
            href={`${flameExplorerUrl}/tx/${txnHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-orange-soft hover:text-orange-soft/80 transition"
          >
            View on Explorer
          </a>
        </div>
      </div>
    </div>
  );
}

function TxnFailed({ txnMsg }: TxnStepsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <ErrorIcon size={170} className="text-orange-soft" />
      <div className="text-white font-medium mt-6 text-center">
        <div className="flex items-center gap-1 justify-center text-base">
          <span>{txnMsg || "An error occurred"}</span>
        </div>
      </div>
    </div>
  );
}

export function SwapTxnSteps({
  txnStatus,
  swapPairs,
  isTiaWtia,
  txnHash,
  txnMsg,
  oneToOneQuote,
}: SwapTxnStepsProps) {
  const inputOne = swapPairs[0]?.inputToken;
  const inputTwo = swapPairs[1]?.inputToken;
  const { expectedOutputFormatted, priceImpact, minimumReceived } = useTxnInfo({
    swapPairs,
  });

  return (
    <div className="h-[320px]">
      {txnStatus === TXN_STATUS.IDLE && !isTiaWtia && (
        <TxnDetails
          inputOne={inputOne}
          inputTwo={inputTwo}
          expectedOutputFormatted={expectedOutputFormatted}
          priceImpact={priceImpact}
          minimumReceived={minimumReceived}
          isTiaWtia={isTiaWtia}
          oneToOneQuote={oneToOneQuote}
        />
      )}
      {txnStatus === TXN_STATUS.PENDING && (
        <TxnLoader
          inputOne={inputOne}
          inputTwo={inputTwo}
          expectedOutputFormatted={expectedOutputFormatted}
          isTiaWtia={isTiaWtia}
        />
      )}
      {txnStatus === TXN_STATUS.SUCCESS && (
        <TxnSuccess
          inputOne={inputOne}
          inputTwo={inputTwo}
          expectedOutputFormatted={expectedOutputFormatted}
          isTiaWtia={isTiaWtia}
          txnHash={txnHash}
        />
      )}
      {txnStatus === TXN_STATUS.FAILED && (
        <TxnFailed
          inputOne={inputOne}
          inputTwo={inputTwo}
          expectedOutputFormatted={expectedOutputFormatted}
          isTiaWtia={isTiaWtia}
          txnHash={txnHash}
          txnMsg={txnMsg}
        />
      )}
    </div>
  );
}
