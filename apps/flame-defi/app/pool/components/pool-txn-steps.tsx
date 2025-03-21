"use client";

import { TXN_STATUS, TxnFailedProps } from "@repo/flame-types";
import {
  BlockLoader,
  Skeleton,
  SuccessCheck,
  TokenIcon,
} from "@repo/ui/components";
import { ErrorIcon } from "@repo/ui/icons";
import { useEvmChainData } from "config";
import { usePathname } from "next/navigation";
import { usePoolPositionContext } from "pool/hooks";
import {
  PoolTxnStepsProps,
  TxnComponentProps,
  TxnLoaderProps,
  TxnSuccessProps,
  POOL_TXN_TYPE,
  getTxnType,
} from "pool/types";
import { useIntl } from "react-intl";

export const CollectFeeTxnSummary = ({ poolTokens }: TxnComponentProps) => {
  const { formatNumber } = useIntl();
  return (
    <>
      <div className="flex flex-col justify-start items-center gap-3 mb-8 mt-6 relative">
        <Skeleton className="rounded-sm w-full" isLoading={false}>
          <div className="flex flex-col bg-semi-white border border-solid border-grey-medium p-4 rounded-xl w-full text-lg gap-2">
            {poolTokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <TokenIcon symbol={token.symbol} size={20} />
                  {token.symbol}
                </span>
                <span>
                  {formatNumber(token.unclaimedFees, {
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

export const AddLiquidityTxnSummary = ({
  poolTokens,
  addLiquidityInputValues,
}: TxnComponentProps) => {
  const { formatNumber } = useIntl();
  const { feeTier } = usePoolPositionContext();

  return (
    <>
      <div className="flex flex-col justify-start items-center gap-3 mb-8 mt-6 relative">
        <Skeleton className="rounded-sm w-full" isLoading={false}>
          <div className="flex flex-col w-full gap-2">
            {poolTokens.map((token, index) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <TokenIcon symbol={token.symbol} size={20} />
                  {token.symbol}
                </span>
                <span>
                  {formatNumber(
                    parseFloat(addLiquidityInputValues?.[index] || "0"),
                    {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    },
                  )}
                </span>
              </div>
            ))}
          </div>
          <hr className="border-t border-border mt-2 mb-2 w-full" />
          <div className="flex justify-between w-full gap-2">
            <span>Fee Tier</span>
            <span>{feeTier}</span>
          </div>
        </Skeleton>
      </div>
    </>
  );
};

export const RemoveLiquidityTxnSummary = ({
  poolTokens,
}: TxnComponentProps) => {
  const { formatNumber } = useIntl();
  return (
    <>
      <div className="flex flex-col justify-start items-center gap-3 mb-8 mt-6 relative">
        <Skeleton className="rounded-sm w-full" isLoading={false}>
          <div className="flex flex-col w-full gap-2">
            {poolTokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  Pooled {token.symbol}:
                </span>
                <span className="flex items-center gap-2">
                  <span>
                    {formatNumber(token.liquidity, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    })}
                  </span>
                  <TokenIcon symbol={token.symbol} size={20} />
                </span>
              </div>
            ))}
          </div>
          <hr className="border-t border-border mt-2 mb-2 w-full" />
          <div className="flex flex-col w-full gap-2">
            {poolTokens.map((token) => (
              <div
                key={token.symbol}
                className="flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {token.symbol} Fees Earned:
                </span>
                <span className="flex items-center gap-2">
                  <span>
                    {formatNumber(token.unclaimedFees, {
                      minimumFractionDigits: 6,
                      maximumFractionDigits: 6,
                    })}
                  </span>
                  <TokenIcon symbol={token.symbol} size={20} />
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

const TxnLoader = ({
  poolTokens,
  addLiquidityInputValues,
  poolTxnType,
}: TxnLoaderProps) => {
  const { formatNumber } = useIntl();

  return (
    <div className="flex flex-col items-center justify-center h-full mt-20">
      <BlockLoader className="mb-20" />
      <div className="text-white font-medium mt-6 text-center">
        <span className="text-base md:text-lg mb-2">
          Confirm Transaction in wallet
        </span>
        <div className="flex items-center gap-1 justify-center text-sm md:text-base">
          {poolTxnType === POOL_TXN_TYPE.COLLECT_FEE && (
            <span>Collecting Fees</span>
          )}
          {poolTxnType === POOL_TXN_TYPE.ADD_LIQUIDITY && (
            <>
              <span>Supplying</span>
              <span className="flex items-center gap-1">
                {formatNumber(parseFloat(addLiquidityInputValues?.[0] || "0"), {
                  minimumFractionDigits: 6,
                  maximumFractionDigits: 6,
                })}
                <span>{poolTokens[0]?.symbol}</span>
              </span>
              <span>and</span>
              <span className="flex items-center gap-1">
                {formatNumber(parseFloat(addLiquidityInputValues?.[1] || "0"), {
                  minimumFractionDigits: 6,
                  maximumFractionDigits: 6,
                })}
                <span>{poolTokens[1]?.symbol}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TxnSuccess = ({ txnHash }: TxnSuccessProps) => {
  const { selectedChain } = useEvmChainData();

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <SuccessCheck />
      <div className="text-white font-medium mt-6 mb-6 text-center w-full">
        <span className="mb-2 text-base md:text-lg">Success</span>
        <div className="flex flex-col md:flex-row items-center gap-1 justify-center text-sm md:text-base">
          {/* <div className="flex items-center gap-1">
            <span>Swapped</span>
            <span>
              {formatDecimalValues(topToken.value || "0", 6)}{" "}
              <span>{topToken.token?.coinDenom}</span>
            </span>
          </div>
          <span>for</span>
          <div className="flex items-center gap-1">
            0<span>{bottomToken.token?.coinDenom}</span>
          </div> */}
        </div>
        <div className="flex items-center gap-1 justify-center text-base">
          <a
            href={`${selectedChain.blockExplorerUrl}/tx/${txnHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-orange-soft hover:text-orange-soft/80 transition text-base md:text-lg underline"
          >
            View on Explorer
          </a>
        </div>
      </div>
    </div>
  );
};

const TxnFailed = ({ txnMsg }: TxnFailedProps) => {
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
};

const TxnDetails = {
  [POOL_TXN_TYPE.ADD_LIQUIDITY]: AddLiquidityTxnSummary,
  [POOL_TXN_TYPE.REMOVE_LIQUIDITY]: RemoveLiquidityTxnSummary,
  [POOL_TXN_TYPE.COLLECT_FEE]: CollectFeeTxnSummary,
} as const;

export function PoolTxnSteps({
  txnStatus,
  poolTokens,
  txnHash,
  txnMsg,
  addLiquidityInputValues,
}: PoolTxnStepsProps) {
  const pathname = usePathname();
  const poolTxnType = getTxnType(pathname);
  const TxnComponent = TxnDetails[poolTxnType];

  return (
    <div>
      {txnStatus === TXN_STATUS.IDLE && (
        <TxnComponent
          poolTokens={poolTokens}
          addLiquidityInputValues={addLiquidityInputValues}
        />
      )}
      {txnStatus === TXN_STATUS.PENDING && (
        <TxnLoader
          poolTokens={poolTokens}
          poolTxnType={poolTxnType}
          addLiquidityInputValues={addLiquidityInputValues}
        />
      )}
      {txnStatus === TXN_STATUS.SUCCESS && (
        <TxnSuccess poolTokens={poolTokens} txnHash={txnHash} />
      )}
      {txnStatus === TXN_STATUS.FAILED && <TxnFailed txnMsg={txnMsg} />}
    </div>
  );
}
