"use client";

import { PositionInfoCard } from "../components";
import { usePoolDetailsContext } from "pool/hooks";
import { PriceRangeBlock, TokenInfoCard } from "pool/components";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { useState } from "react";

export const ContentSection = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { selectedSymbol, handleReverseTokenData, symbols, tokenData } =
    usePoolDetailsContext();

  return (
    <div className="flex flex-col flex-1 mt-12">
      <PriceRangeBlock
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        handleReverseTokenData={handleReverseTokenData}
      />
      <div className="flex flex-col gap-4 mt-4 items-end">
        <div className="flex gap-2 w-full">
          <div className="flex flex-col gap-2 w-2/4">
            <PositionInfoCard leftLabel="Liquidity" value="$-" />
            <TokenInfoCard tokenData={tokenData} showLiquidity={true} />
          </div>
          <div className="flex flex-col gap-2 w-2/4">
            <PositionInfoCard leftLabel="Unclaimed fees" value="$-" />
            <TokenInfoCard tokenData={tokenData} />
          </div>
        </div>
        <div className="w-2/4">
          <ConfirmationModal
            open={modalOpen}
            buttonText={"Collect Fees"}
            actionButtonText={"Collect"}
            showOpenButton={true}
            handleOpenModal={() => setModalOpen(true)}
            handleModalActionButton={() => console.log("handle action button")}
            handleCloseModal={() => setModalOpen(false)}
            title={"Claim Fees"}
          >
            {/* Add CollectFeesModal steps here */}
            <div>Stuff here</div>
          </ConfirmationModal>
        </div>
      </div>
    </div>
  );
};
