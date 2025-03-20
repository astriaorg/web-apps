"use client";

import { PositionInfoCard } from "../components";
import { usePoolDetailsContext } from "pool/hooks";
import { PoolTxnSteps, PriceRangeBlock, TokenInfoCard } from "pool/components";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { Switch } from "@repo/ui/components";
import { TXN_STATUS } from "@repo/flame-types";

export const ContentSection = () => {
  const {
    selectedSymbol,
    handleReverseTokenData,
    symbols,
    tokenData,
    collectAsWTIA,
    handleCollectAsWTIA,
    modalOpen,
    setModalOpen,
  } = usePoolDetailsContext();

  return (
    <div className="flex flex-col flex-1 mt-12">
      <PriceRangeBlock
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        handleReverseTokenData={handleReverseTokenData}
      />
      <div className="flex flex-col gap-4 mt-4 items-end">
        <div className="flex items-center gap-2 justify-end">
          <span className="text-sm">Collect as WTIA</span>
          <Switch
            checked={collectAsWTIA}
            onCheckedChange={() => handleCollectAsWTIA(!collectAsWTIA)}
            className="h-7 w-12 data-[state=unchecked]:bg-grey-light data-[state=checked]:bg-orange [&>span]:h-6 [&>span]:w-6 [&>span[data-state=checked]]:translate-x-5"
          />
        </div>
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
  );
};
