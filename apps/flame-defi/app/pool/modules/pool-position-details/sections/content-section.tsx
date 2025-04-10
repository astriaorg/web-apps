"use client";

import { PositionInfoCard } from "../components";
import { usePoolPositionContext, usePoolContext } from "pool/hooks";
import { PoolTxnSteps, PriceRangeBlock, TokenInfoCard } from "pool/components";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { Skeleton, Switch } from "@repo/ui/components";
import { TXN_STATUS } from "@repo/flame-types";

export const ContentSection = () => {
  const { modalOpen, setModalOpen } = usePoolContext();
  const {
    selectedSymbol,
    handleReverseTokenData,
    poolToken0,
    poolToken1,
    collectAsWrappedNative,
    handleCollectAsWrappedNative,
    isReversedPoolTokens,
  } = usePoolPositionContext();
  const poolTokens = isReversedPoolTokens
    ? [poolToken1, poolToken0]
    : [poolToken0, poolToken1];
  const token0 = poolTokens[0] || null;
  const token1 = poolTokens[1] || null;
  const hasUnclaimedFees =
    token0?.unclaimedFees &&
    token1?.unclaimedFees &&
    token0.unclaimedFees > 0 &&
    token1.unclaimedFees > 0
      ? true
      : false;

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
              checked={collectAsWrappedNative}
              onCheckedChange={() =>
                handleCollectAsWrappedNative(!collectAsWrappedNative)
              }
              className="h-7 w-12 data-[state=unchecked]:bg-grey-light data-[state=checked]:bg-orange [&>span]:h-6 [&>span]:w-6 [&>span[data-state=checked]]:translate-x-5"
            />
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-2 w-full">
          <div className="flex flex-col gap-2 w-full md:w-2/4">
            {/* TODO: Add liquidity value */}
            <PositionInfoCard leftLabel="Liquidity" value="$-" />
            <TokenInfoCard
              poolToken0={token0}
              poolToken1={token1}
              showLiquidity={true}
              showLiquidityPercentage
            />
          </div>
          <div className="flex flex-col gap-2 w-full md:w-2/4">
            {/* TODO: Add unclaimed fees value */}
            <PositionInfoCard leftLabel="Unclaimed fees" value="$-" />
            <TokenInfoCard poolToken0={token0} poolToken1={token1} />
          </div>
        </div>
        {hasUnclaimedFees && (
          <div className="w-full md:w-2/4">
            <Skeleton
              className="w-full h-[40px]"
              isLoading={!token0 || !token1}
            >
              {token0 && token1 && (
                <ConfirmationModal
                  open={modalOpen}
                  buttonText={"Collect Fees"}
                  actionButtonText={"Collect"}
                  showOpenButton={true}
                  handleOpenModal={() => setModalOpen(true)}
                  handleModalActionButton={() =>
                    console.log("handle action button")
                  }
                  handleCloseModal={() => setModalOpen(false)}
                  title={"Claim Fees"}
                >
                  <PoolTxnSteps
                    txnStatus={TXN_STATUS.IDLE}
                    poolTokens={[token0, token1]}
                    txnHash={"0x"}
                    txnMsg={""}
                    addLiquidityInputValues={null}
                  />
                </ConfirmationModal>
              )}
            </Skeleton>
          </div>
        )}
      </div>
    </div>
  );
};
