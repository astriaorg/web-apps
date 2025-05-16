"use client";

import { useCallback } from "react";
import { useIntl } from "react-intl";

import { TransactionStatus } from "@repo/flame-types";
import { Switch } from "@repo/ui/components";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import {
  PoolTransactionSteps,
  PriceRangeBlock,
  TokenInfoCard,
} from "pool/components";
import {
  useCollectFeesTransaction,
  usePoolContext,
  usePoolPositionContext,
} from "pool/hooks";
import { PositionInfoCard } from "pool/modules/position-details/components";

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
  const hasValidTokens = poolToken0 && poolToken1;
  const tokens = hasValidTokens ? [poolToken0, poolToken1] : [];
  const { status, hash, error, setStatus, setError, collectFees } =
    useCollectFeesTransaction(tokens, isCollectAsWrappedNative);

  // NOTE: This poolTokensForDisplay is necessary for the pool position details page to be able to reverse the token order in all components on the page.
  // All other pages only reverse the values of the price range block when this happens.
  const poolTokensForDisplay = isReversedPoolTokens
    ? [...tokens].reverse()
    : tokens;
  const token0ForDisplay = poolTokensForDisplay[0] ?? null;
  const token1ForDisplay = poolTokensForDisplay[1] ?? null;

  const hasUnclaimedFees = Boolean(
    token0ForDisplay?.unclaimedFees &&
      token1ForDisplay?.unclaimedFees &&
      token0ForDisplay.unclaimedFees > 0 &&
      token1ForDisplay.unclaimedFees > 0,
  );

  const totalLiquidity = tokens.reduce(
    (sum, token) => sum + token.liquidity,
    0,
  );
  const totalUnclaimedFees = tokens.reduce(
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
    setStatus(TransactionStatus.IDLE);
    refreshPoolPosition();
    setError(null);
  }, [setModalOpen, setStatus, refreshPoolPosition, setError]);

  const handleModalActionButton = useCallback(() => {
    if (status !== TransactionStatus.IDLE) {
      handleCloseModal();
    } else {
      collectFees();
    }
  }, [handleCloseModal, collectFees, status]);

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
        {hasUnclaimedFees && tokens.length > 0 && (
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
              <PoolTransactionSteps
                status={status}
                tokens={tokens}
                hash={hash}
                message={error || ""}
                addLiquidityInputValues={null}
              />
            </ConfirmationModal>
          </div>
        )}
      </div>
    </div>
  );
};
