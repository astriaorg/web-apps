"use client";

import { TokenLiquidityBlock } from "../components";
import { Switch } from "@repo/ui/components";
import { RemoveAmountSlider } from "../components";
import {
  usePoolContext,
  usePoolPositionContext,
  useRemoveLiquidity,
} from "pool/hooks";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { PoolTxnSteps } from "pool/components";

export const ContentSection = () => {
  const { modalOpen, setModalOpen, txnStatus } = usePoolContext();
  const { collectAsNative, handleCollectAsNative } = usePoolPositionContext();
  const { liquidityToRemove, handlePercentToRemove } = useRemoveLiquidity();

  return (
    <div className="flex flex-col flex-1 mt-0 md:mt-12">
      <div className="flex flex-col gap-4 mt-4">
        <TokenLiquidityBlock liquidityToRemove={liquidityToRemove} />
        <div className="flex items-center justify-between mt-8">
          <h2 className="text-lg font-medium">Amount to Remove</h2>

          <div className="flex items-center gap-2">
            <span className="text-sm">Collect as WTIA</span>
            <Switch
              checked={collectAsNative}
              onCheckedChange={() => handleCollectAsNative(!collectAsNative)}
              className="h-7 w-12 data-[state=unchecked]:bg-grey-light data-[state=checked]:bg-orange [&>span]:h-6 [&>span]:w-6 [&>span[data-state=checked]]:translate-x-5"
            />
          </div>
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
              actionButtonText={"Remove"}
              showOpenButton={true}
              handleOpenModal={() => setModalOpen(true)}
              handleModalActionButton={() =>
                console.log("handle action button")
              }
              handleCloseModal={() => setModalOpen(false)}
              title={"Remove liquidity"}
            >
              <PoolTxnSteps
                txnStatus={txnStatus}
                poolTokens={liquidityToRemove}
                txnHash={"0x"}
                txnMsg={""}
                addLiquidityInputValues={null}
              />
            </ConfirmationModal>
          </div>
        </div>
      </div>
    </div>
  );
};
