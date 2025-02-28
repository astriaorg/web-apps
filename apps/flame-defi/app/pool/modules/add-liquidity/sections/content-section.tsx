"use client";

import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
// import { PriceRangeBlock } from "pool/components";
import { TokenLiquidityBlock, AddLiquidityInputsBlock } from "../components";
import { PoolTxnSteps } from "pool/components";
import { TXN_STATUS } from "@repo/flame-types";
import { usePoolDetailsContext } from "pool/hooks";

export const ContentSection = () => {
  const { tokenData, modalOpen, setModalOpen, feeTier } = usePoolDetailsContext();
  // NOTE: Do we actually need the price range block in this component. Do people want this information here?
  return (
    <div className="flex flex-col flex-1 mt-12">
      {/* <PriceRangeBlock
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        handleReverseTokenData={handleReverseTokenData}
      /> */}
      <div className="flex flex-col gap-4 mt-4">
        <TokenLiquidityBlock />
        <AddLiquidityInputsBlock />
        <div className="flex w-full gap-4">
          <div className="w-1/2" />
          <div className="w-1/2">
            <ConfirmationModal
              open={modalOpen}
              buttonText={"Add liquidity"}
              actionButtonText={"Add liquidity"}
              showOpenButton={true}
              handleOpenModal={() => setModalOpen(true)}
              handleModalActionButton={() =>
                console.log("handle action button")
              }
              handleCloseModal={() => setModalOpen(false)}
              title={"Add liquidity"}
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
