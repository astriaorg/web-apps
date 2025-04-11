"use client";

import { PositionInfoCard } from "../components";
import {
  usePoolPositionContext,
  usePoolContext,
  useCollectFeesTxn,
} from "pool/hooks";
import { PoolTxnSteps, PriceRangeBlock, TokenInfoCard } from "pool/components";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { Switch } from "@repo/ui/components";
import { useIntl } from "react-intl";
import { useCallback } from "react";
import { TXN_STATUS } from "@repo/flame-types";
export const ContentSection = () => {
  const { modalOpen, setModalOpen } = usePoolContext();
  const { formatNumber } = useIntl();
  const {
    selectedSymbol,
    handleReverseTokenData,
    poolToken0,
    poolToken1,
    isCollectAsWrappedNative,
    handleCollectAsWrappedNative,
    isReversedPoolTokens,
    refreshPoolPosition,
  } = usePoolPositionContext();
  const poolTokens = poolToken0 && poolToken1 ? [poolToken0, poolToken1] : [];
  const {
    txnStatus,
    txnHash,
    errorText,
    setTxnStatus,
    setErrorText,
    collectFees,
  } = useCollectFeesTxn(poolTokens, isCollectAsWrappedNative);
  const poolTokensForDisplay = isReversedPoolTokens
    ? [poolToken1, poolToken0]
    : [poolToken0, poolToken1];
  const token0ForDisplay = poolTokensForDisplay[0] || null;
  const token1ForDisplay = poolTokensForDisplay[1] || null;

  const hasUnclaimedFees = Boolean(
    token0ForDisplay?.unclaimedFees &&
      token1ForDisplay?.unclaimedFees &&
      token0ForDisplay.unclaimedFees > 0 &&
      token1ForDisplay.unclaimedFees > 0,
  );

  const totalLiquidity = poolTokens.reduce(
    (sum, token) => sum + token.liquidity,
    0,
  );
  const totalUnclaimedFees = poolTokens.reduce(
    (sum, token) => sum + token.unclaimedFees,
    0,
  );
  const formattedLiquidity =
    totalLiquidity > 0
      ? formatNumber(totalLiquidity, {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "$-";
  const formattedUnclaimedFees =
    totalUnclaimedFees > 0
      ? formatNumber(totalUnclaimedFees, {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "$-";

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setTxnStatus(TXN_STATUS.IDLE);
    refreshPoolPosition();
    setErrorText(null);
  }, [setModalOpen, setTxnStatus, refreshPoolPosition, setErrorText]);

  const handleModalActionButton = useCallback(() => {
    if (txnStatus !== TXN_STATUS.IDLE) {
      handleCloseModal();
    } else {
      collectFees();
    }
  }, [handleCloseModal, collectFees, txnStatus]);

  return (
    <div className="flex flex-col flex-1 mt-8">
      <PriceRangeBlock
        symbols={[
          poolToken0?.token.coinDenom ?? "",
          poolToken1?.token.coinDenom ?? "",
        ]}
        selectedSymbol={selectedSymbol}
        handleReverseTokenData={handleReverseTokenData}
      />
      <div className="flex flex-col gap-4 mt-4 items-end">
        {hasUnclaimedFees && (
          <div className="flex items-center gap-2 justify-end">
            <span className="text-sm">Collect as WTIA</span>
            <Switch
              checked={isCollectAsWrappedNative}
              onCheckedChange={() =>
                handleCollectAsWrappedNative(!isCollectAsWrappedNative)
              }
              className="h-7 w-12 data-[state=unchecked]:bg-grey-light data-[state=checked]:bg-orange [&>span]:h-6 [&>span]:w-6 [&>span[data-state=checked]]:translate-x-5"
            />
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-2 w-full">
          <div className="flex flex-col gap-2 w-full md:w-2/4">
            <PositionInfoCard
              leftLabel="Liquidity"
              value={formattedLiquidity}
            />
            <TokenInfoCard
              poolToken0={token0ForDisplay}
              poolToken1={token1ForDisplay}
              showLiquidity={true}
              showLiquidityPercentage
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-2/4">
            <PositionInfoCard
              leftLabel="Unclaimed fees"
              value={formattedUnclaimedFees}
            />
            <TokenInfoCard
              poolToken0={token0ForDisplay}
              poolToken1={token1ForDisplay}
            />
          </div>
        </div>
        {hasUnclaimedFees && poolTokens.length > 0 && (
          <div className="w-full md:w-2/4">
            <ConfirmationModal
              open={modalOpen}
              buttonText={"Collect Fees"}
              actionButtonText={"Collect"}
              showOpenButton={true}
              handleOpenModal={() => setModalOpen(true)}
              handleModalActionButton={handleModalActionButton}
              handleCloseModal={handleCloseModal}
              title={"Claim Fees"}
            >
              <PoolTxnSteps
                txnStatus={txnStatus}
                poolTokens={poolTokens}
                txnHash={txnHash}
                txnMsg={errorText || ""}
                addLiquidityInputValues={null}
              />
            </ConfirmationModal>
          </div>
        )}
      </div>
    </div>
  );
};
