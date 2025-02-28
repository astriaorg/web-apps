"use client";

import { TokenLiquidityBlock } from "../components";
import { Switch } from "@repo/ui/components";
import { RemoveAmountSlider } from "../components";
import { usePoolDetailsContext } from "pool/hooks";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { TXN_STATUS } from "@repo/flame-types";
import { PoolTxnSteps } from "pool/components";

export const ContentSection = () => {
  const { collectAsWTIA, handleCollectAsWTIA, tokenData, modalOpen, setModalOpen } = usePoolDetailsContext();

  return (
    <div className="flex flex-col flex-1 mt-12">
      <div className="flex flex-col gap-4 mt-4">
        <TokenLiquidityBlock />
        <div className="flex items-center justify-between mt-8">
          <h2 className="text-lg font-medium">Amount to Remove</h2>

          <div className="flex items-center gap-2">
            <span className="text-sm">Collect as WTIA</span>
            <Switch
              checked={collectAsWTIA}
              onCheckedChange={() => handleCollectAsWTIA(!collectAsWTIA)}
              className="h-7 w-12 data-[state=unchecked]:bg-grey-light data-[state=checked]:bg-orange [&>span]:h-6 [&>span]:w-6 [&>span[data-state=checked]]:translate-x-5"
            />
          </div>
        </div>
        <div className="flex gap-4 w-full bg-surface-1 rounded-lg p-4">
          <RemoveAmountSlider />
        </div>
        <div className="flex w-full gap-4">
          <div className="w-1/2" />
          <div className="w-1/2">
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
                txnStatus={TXN_STATUS.IDLE}
                poolPositionData={tokenData}
                txnHash={""}
                txnMsg={""}
              />
            </ConfirmationModal>
          </div>
        </div>
      </div>
    </div>
  );
};
