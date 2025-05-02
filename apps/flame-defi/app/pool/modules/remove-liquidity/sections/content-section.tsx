"use client";

import { useCallback } from "react";

import { TXN_STATUS } from "@repo/flame-types";
import { Switch } from "@repo/ui/components";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { PoolTxnSteps } from "pool/components";
import {
  usePoolContext,
  usePoolPositionContext,
  useRemoveLiquidityPercentage,
  useRemoveLiquidityTxn,
} from "pool/hooks";

import { TokenLiquidityBlock } from "../components";
import { RemoveAmountSlider } from "../components";

export const ContentSection = () => {
  const { modalOpen, setModalOpen } = usePoolContext();
  const {
    poolToken0,
    poolToken1,
    isCollectAsWrappedNative,
    handleCollectAsWrappedNative,
    refreshPoolPosition,
  } = usePoolPositionContext();
  const {
    liquidityToRemove,
    handlePercentToRemove,
    percentageToRemove,
    refreshLiquidityToRemove,
  } = useRemoveLiquidityPercentage();
  const {
    removeLiquidity,
    txnHash,
    txnStatus,
    setTxnStatus,
    errorText,
    setErrorText,
  } = useRemoveLiquidityTxn(
    liquidityToRemove,
    isCollectAsWrappedNative,
    percentageToRemove,
  );
  const poolContainsNativeOrWrappedToken =
    poolToken0?.token.isNative ||
    poolToken1?.token.isNative ||
    poolToken0?.token.isWrappedNative ||
    poolToken1?.token.isWrappedNative;

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setTxnStatus(TXN_STATUS.IDLE);
    setErrorText(null);
    refreshPoolPosition();
    refreshLiquidityToRemove();
    handleCollectAsWrappedNative(false);
  }, [
    setModalOpen,
    setTxnStatus,
    setErrorText,
    refreshPoolPosition,
    refreshLiquidityToRemove,
    handleCollectAsWrappedNative,
  ]);

  const handleModalActionButton = useCallback(() => {
    if (txnStatus !== TXN_STATUS.IDLE) {
      handleCloseModal();
    } else {
      removeLiquidity();
    }
  }, [handleCloseModal, removeLiquidity, txnStatus]);

  return (
    <div className="flex flex-col flex-1 mt-0 md:mt-12">
      <div className="flex flex-col gap-4 mt-4">
        <TokenLiquidityBlock liquidityToRemove={liquidityToRemove} />
        <div className="flex items-center justify-between mt-8">
          <h2 className="text-lg font-medium">Amount to Remove</h2>

          {poolContainsNativeOrWrappedToken && (
            <div className="flex items-center gap-2">
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
        </div>
        <div className="flex gap-4 w-full bg-surface-1 rounded-lg p-4">
          <RemoveAmountSlider handlePercentToRemove={handlePercentToRemove} />
        </div>
        <div className="flex w-full gap-4">
          <div className="hidden md:block md:w-1/2" />
          <div className="w-full md:w-1/2">
            <ConfirmationModal
              open={modalOpen}
              buttonText={"Remove liquidity"}
              actionButtonText={
                txnStatus !== TXN_STATUS.IDLE ? "Close" : "Remove liquidity"
              }
              showOpenButton={true}
              handleOpenModal={() => setModalOpen(true)}
              handleModalActionButton={handleModalActionButton}
              handleCloseModal={handleCloseModal}
              title={"Remove liquidity"}
            >
              <PoolTxnSteps
                txnStatus={txnStatus}
                poolTokens={liquidityToRemove}
                txnHash={txnHash}
                txnMsg={errorText ?? ""}
                addLiquidityInputValues={null}
              />
            </ConfirmationModal>
          </div>
        </div>
      </div>
    </div>
  );
};
