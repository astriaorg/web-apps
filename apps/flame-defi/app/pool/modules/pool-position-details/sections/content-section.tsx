"use client";

import { PositionInfoCard } from "../components";
import { usePoolPositionContext, usePoolContext } from "pool/hooks";
import { PoolTxnSteps, PriceRangeBlock, TokenInfoCard } from "pool/components";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { Switch } from "@repo/ui/components";

export const ContentSection = () => {
  const { modalOpen, setModalOpen, txnStatus } = usePoolContext();
  const {
    selectedSymbol,
    handleReverseTokenData,
    symbols,
    poolTokenOne,
    poolTokenTwo,
    collectAsNative,
    handleCollectAsNative,
  } = usePoolPositionContext();

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
            checked={collectAsNative}
            onCheckedChange={() => handleCollectAsNative(!collectAsNative)}
            className="h-7 w-12 data-[state=unchecked]:bg-grey-light data-[state=checked]:bg-orange [&>span]:h-6 [&>span]:w-6 [&>span[data-state=checked]]:translate-x-5"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full">
          <div className="flex flex-col gap-2 w-full md:w-2/4">
            <PositionInfoCard leftLabel="Liquidity" value="$-" />
            <TokenInfoCard poolTokenOne={poolTokenOne} poolTokenTwo={poolTokenTwo} showLiquidity={true} showLiquidityPercentage/>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-2/4">
            <PositionInfoCard leftLabel="Unclaimed fees" value="$-" />
            <TokenInfoCard poolTokenOne={poolTokenOne} poolTokenTwo={poolTokenTwo} />
          </div>
        </div>
        <div className="w-full md:w-2/4">
        {poolTokenOne && poolTokenTwo && (
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
              txnStatus={txnStatus}
              poolTokens={[poolTokenOne, poolTokenTwo]}
              txnHash={""}
              txnMsg={""}
              addLiquidityInputValues={null}
            />
          </ConfirmationModal>
        )}
        </div>
      </div>
    </div>
  );
};
