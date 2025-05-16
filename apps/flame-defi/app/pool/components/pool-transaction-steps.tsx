"use client";

import { usePathname } from "next/navigation";
import { useIntl } from "react-intl";

import { TransactionFailedProps, TransactionStatus } from "@repo/flame-types";
import {
  BlockLoader,
  Skeleton,
  SuccessCheck,
  ToggleSwitch,
  TokenIcon,
} from "@repo/ui/components";
import { ErrorIcon } from "@repo/ui/icons";
import { useAstriaChainData } from "config";
import { usePoolPositionContext } from "pool/hooks";
import {
  getTransactionType,
  PoolTransactionStepsProps,
  PoolTransactionType,
  TransactionComponentProps,
  TransactionLoaderProps,
  TransactionSuccessProps,
} from "pool/types";

import { PriceRangeCard } from "./price-range-card";

export const CollectFeeTransactionSummary = ({
  tokens,
}: TransactionComponentProps) => {
  const { formatNumber } = useIntl();
  return (
    <>
      <div className="flex flex-col justify-start items-center gap-3 mb-8 mt-6 relative">
        <Skeleton className="rounded-sm w-full" isLoading={false}>
          <div className="flex flex-col bg-semi-white border border-solid border-grey-medium p-4 rounded-xl w-full text-lg gap-2">
            {tokens.map(({ token, unclaimedFees }) => (
              <div
                key={token.coinDenom}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <TokenIcon symbol={token.coinDenom} size={20} />
                  {token.coinDenom}
                </span>
                <span>
                  {formatNumber(unclaimedFees, {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6,
                  })}
                </span>
              </div>
            ))}
          </div>
        </Skeleton>
        <span className="text-xs">
          Collecting fees will withdraw currently available fees for you.
        </span>
      </div>
    </>
  );
};

export const AddLiquidityTransactionSummary = ({
  tokens,
  addLiquidityInputValues,
  selectedFeeTier,
}: TransactionComponentProps) => {
  const { formatNumber } = useIntl();
  const {
    feeTier,
    currentPrice,
    minPrice,
    maxPrice,
    selectedSymbol,
    handleReverseTokenData,
  } = usePoolPositionContext();

  return (
    <>
      <div className="flex flex-col justify-start items-center gap-3 mb-8 mt-6 relative">
        <Skeleton className="rounded-sm w-full" isLoading={false}>
          <div className="flex flex-col w-full gap-2">
            {tokens.map(({ token }, index) => (
              <div
                key={token.coinDenom}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <TokenIcon symbol={token.coinDenom} size={20} />
                  {token.coinDenom}
                </span>
                <span>
                  {addLiquidityInputValues &&
                    addLiquidityInputValues[index] &&
                    formatNumber(parseFloat(addLiquidityInputValues[index]), {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    })}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between w-full gap-2">
            <span>Fee Tier</span>
            <span>{selectedFeeTier || feeTier}</span>
          </div>
        </Skeleton>

        <hr className="border-t border-border mt-2 mb-2 w-full" />

        <div className="flex gap-4 mb-2 w-full justify-between items-center">
          <h2 className="text-base font-medium">Selected Range</h2>
          <Skeleton
            className="w-[200px] h-[40px]"
            isLoading={tokens.length === 0}
          >
            <ToggleSwitch
              toggleOptions={tokens.map(({ token }) => token.coinDenom)}
              className="text-sm w-[200px] h-[40px]"
              selectedOption={selectedSymbol}
              setSelectedOption={handleReverseTokenData}
            />
          </Skeleton>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <PriceRangeCard
            leftLabel="Current price"
            value={currentPrice}
            variant="small"
          />
          <PriceRangeCard
            leftLabel="Min price"
            tooltipText={`Your position will be 100% ${selectedSymbol} at this price.`}
            value={minPrice}
            variant="small"
          />
          <PriceRangeCard
            leftLabel="Max price"
            tooltipText={`Your position will be 100% ${tokens[0]?.token.coinDenom === selectedSymbol ? tokens[1]?.token.coinDenom : tokens[0]?.token.coinDenom} at this price.`}
            value={maxPrice}
            variant="small"
          />
        </div>
      </div>
    </>
  );
};

export const RemoveLiquidityTransactionSummary = ({
  tokens,
}: TransactionComponentProps) => {
  const { formatNumber } = useIntl();
  return (
    <>
      <div className="flex flex-col justify-start items-center gap-3 mb-8 mt-6 relative">
        <Skeleton className="rounded-sm w-full" isLoading={false}>
          <div className="flex flex-col w-full gap-2">
            {tokens.map(({ token, liquidity }) => (
              <div
                key={token.coinDenom}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  Pooled {token.coinDenom}:
                </span>
                <span className="flex items-center gap-2">
                  <span>
                    {formatNumber(liquidity, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    })}
                  </span>
                  <TokenIcon symbol={token.coinDenom} size={20} />
                </span>
              </div>
            ))}
          </div>
          <hr className="border-t border-border mt-2 mb-2 w-full" />
          <div className="flex flex-col w-full gap-2">
            {tokens.map(({ token, unclaimedFees }) => (
              <div
                key={token.coinDenom}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {token.coinDenom} Fees Earned:
                </span>
                <span className="flex items-center gap-2">
                  <span>
                    {formatNumber(unclaimedFees, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    })}
                  </span>
                  <TokenIcon symbol={token.coinDenom} size={20} />
                </span>
              </div>
            ))}
            <span className="text-xs w-full text-left mt-2">
              You will also collect fees earned from this position.
            </span>
          </div>
        </Skeleton>
      </div>
    </>
  );
};

const TransactionLoader = ({
  tokens,
  addLiquidityInputValues,
  type,
}: TransactionLoaderProps) => {
  const { formatNumber } = useIntl();

  return (
    <div className="flex flex-col items-center justify-center h-full mt-20">
      <BlockLoader className="mb-20" />
      <div className="text-white font-medium mt-6 text-center">
        <span className="text-base md:text-lg mb-2">
          Confirm Transaction in wallet
        </span>
        <div className="flex items-center gap-1 justify-center text-sm md:text-base">
          {type === PoolTransactionType.COLLECT_FEE && (
            <span>Collecting Fees</span>
          )}
          {addLiquidityInputValues?.[0] && addLiquidityInputValues?.[1] && (
            <>
              <span>Supplying</span>
              <span className="flex items-center gap-1">
                {formatNumber(parseFloat(addLiquidityInputValues[0]), {
                  minimumFractionDigits: 6,
                  maximumFractionDigits: 6,
                })}
                <span>{tokens[0]?.token.coinDenom}</span>
              </span>
              <span>and</span>
              <span className="flex items-center gap-1">
                {formatNumber(parseFloat(addLiquidityInputValues[1]), {
                  minimumFractionDigits: 6,
                  maximumFractionDigits: 6,
                })}
                <span>{tokens[1]?.token.coinDenom}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TransactionSuccess = ({ tokens, hash }: TransactionSuccessProps) => {
  const { chain } = useAstriaChainData();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <SuccessCheck />
      <div className="text-white font-medium mt-6 mb-6 text-center w-full">
        <div className="flex flex-col md:flex-row items-center gap-1 justify-center text-sm md:text-base">
          {tokens[0] && tokens[1] && (
            <div className="flex items-center gap-1">
              <span>
                Successfully added {tokens[0].token.coinDenom} /{" "}
                {tokens[1].token.coinDenom} liquidity
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 justify-center text-base">
          <a
            href={`${chain.blockExplorerUrl}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-orange hover:text-orange/80 transition text-base md:text-lg underline"
          >
            View on Explorer
          </a>
        </div>
      </div>
    </div>
  );
};

const TransactionFailed = ({ message }: TransactionFailedProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <ErrorIcon size={170} className="text-orange" />
      <div className="text-white font-medium mt-6 text-center">
        <div className="flex items-center gap-1 justify-center text-base">
          <span>{message || "An error occurred."}</span>
        </div>
      </div>
    </div>
  );
};

const TransactionDetails = {
  [PoolTransactionType.ADD_LIQUIDITY]: AddLiquidityTransactionSummary,
  [PoolTransactionType.NEW_POSITION]: AddLiquidityTransactionSummary,
  [PoolTransactionType.REMOVE_LIQUIDITY]: RemoveLiquidityTransactionSummary,
  [PoolTransactionType.COLLECT_FEE]: CollectFeeTransactionSummary,
} as const;

export const PoolTransactionSteps = ({
  status,
  tokens,
  hash,
  message,
  addLiquidityInputValues,
  selectedFeeTier,
}: PoolTransactionStepsProps) => {
  const pathname = usePathname();
  const poolTransactionType = getTransactionType(pathname);
  const TransactionComponent = TransactionDetails[poolTransactionType];

  return (
    <div>
      {status === TransactionStatus.IDLE && (
        <TransactionComponent
          tokens={tokens}
          addLiquidityInputValues={addLiquidityInputValues}
          selectedFeeTier={selectedFeeTier}
        />
      )}
      {status === TransactionStatus.PENDING && (
        <TransactionLoader
          tokens={tokens}
          type={poolTransactionType}
          addLiquidityInputValues={addLiquidityInputValues}
        />
      )}
      {status === TransactionStatus.SUCCESS && hash && (
        <TransactionSuccess tokens={tokens} hash={hash} />
      )}
      {status === TransactionStatus.FAILED && (
        <TransactionFailed message={message} />
      )}
    </div>
  );
};
