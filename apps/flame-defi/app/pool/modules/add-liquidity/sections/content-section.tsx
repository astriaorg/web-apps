"use client";

import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
// import { PriceRangeBlock } from "pool/components";
import { TokenLiquidityBlock, AddLiquidityInputsBlock } from "../components";
import { PoolTxnSteps } from "pool/components";
import { TXN_STATUS } from "@repo/flame-types";
import { usePoolDetailsContext } from "pool/hooks";
import { useState } from "react";

export const ContentSection = () => {
  const { poolTokenData, modalOpen, setModalOpen, setTxnStatus, txnStatus } =
    usePoolDetailsContext();
  const [inputOne, setInputOne] = useState<string>("");
  const [inputTwo, setInputTwo] = useState<string>("");

  return (
    <div className="flex flex-col flex-1 mt-0 md:mt-12">
      {/* 
        NOTE: Do we actually need the price range block in this component. Do people want this information here?
      <PriceRangeBlock
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        handleReverseTokenData={handleReverseTokenData}
      /> */}
      <div className="flex flex-col gap-4 mt-4">
        <TokenLiquidityBlock />
        <AddLiquidityInputsBlock
          inputOne={inputOne}
          inputTwo={inputTwo}
          setInputOne={setInputOne}
          setInputTwo={setInputTwo}
        />
        <div className="flex w-full gap-4">
          <div className="hidden md:block md:w-1/2" />
          <div className="w-full md:w-1/2">
            <ConfirmationModal
              open={modalOpen}
              buttonText={"Add liquidity"}
              actionButtonText={
                txnStatus === TXN_STATUS.PENDING ? "Close" : "Add liquidity"
              }
              showOpenButton={true}
              handleOpenModal={() => setModalOpen(true)}
              handleModalActionButton={() => {
                if (txnStatus === TXN_STATUS.IDLE) {
                  setTxnStatus(TXN_STATUS.PENDING);
                } else {
                  setTxnStatus(TXN_STATUS.IDLE);
                  setModalOpen(false);
                }
              }}
              handleCloseModal={() => setModalOpen(false)}
              title={"Add liquidity"}
            >
              <PoolTxnSteps
                txnStatus={txnStatus}
                poolPositionData={poolTokenData}
                addLiquidityInputValues={[inputOne, inputTwo]}
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
