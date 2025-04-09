"use client";

import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { TokenLiquidityBlock, AddLiquidityInputsBlock } from "../components";
import { PoolTxnSteps, PriceRangeBlock } from "pool/components";
import { TXN_STATUS } from "@repo/flame-types";
import {
  useAddLiquidityTxn,
  useGetPoolTokenBalances,
  usePoolContext,
  usePoolPositionContext,
  useAddLiquidityValidation,
} from "pool/hooks";
import { useCallback, useState } from "react";
import { POOL_INPUT_ID } from "pool/types";

export const ContentSection = () => {
  const { modalOpen, setModalOpen } = usePoolContext();
  const {
    poolToken0,
    poolToken1,
    feeTier,
    currentPrice,
    selectedSymbol,
    handleReverseTokenData,
    refreshPoolPosition,
  } = usePoolPositionContext();
  const [input0, setInput0] = useState<string>("");
  const [input1, setInput1] = useState<string>("");
  const { token0, token1, token0Balance, token1Balance, refreshBalances } =
    useGetPoolTokenBalances(
      poolToken0?.token.coinDenom ?? "",
      poolToken1?.token.coinDenom ?? "",
    );
  const {
    addLiquidity,
    txnStatus,
    txnHash,
    errorText,
    setErrorText,
    setTxnStatus,
  } = useAddLiquidityTxn(input0, input1);
  const { validPoolInputs, buttonText } = useAddLiquidityValidation(
    input0,
    input1,
    token0Balance,
    token1Balance,
  );

  const getTokenCalculatedTokenValue = useCallback(
    (value: string, sourceId: POOL_INPUT_ID, coinDecimals: number) => {
      if (!value || isNaN(Number(value)) || !currentPrice) return "";
      const numericValue = parseFloat(value);
      const numericPrice = parseFloat(currentPrice);

      const tokenValue =
        sourceId === POOL_INPUT_ID.INPUT_ZERO
          ? numericValue * numericPrice
          : numericValue / numericPrice;

      return tokenValue.toFixed(coinDecimals);
    },
    [currentPrice],
  );

  const handleInputChange = useCallback(
    (value: string, id: POOL_INPUT_ID, coinDecimals?: number) => {
      if (!coinDecimals) return;
      setErrorText(null);
      if (id === POOL_INPUT_ID.INPUT_ZERO) {
        setInput0(value);
        setInput1(getTokenCalculatedTokenValue(value, id, coinDecimals));
      } else {
        setInput1(value);
        setInput0(getTokenCalculatedTokenValue(value, id, coinDecimals));
      }
    },
    [getTokenCalculatedTokenValue, setErrorText],
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setTxnStatus(TXN_STATUS.IDLE);
    setInput0("");
    setInput1("");
    refreshPoolPosition();
    refreshBalances();
  }, [
    setModalOpen,
    setInput0,
    setInput1,
    setTxnStatus,
    refreshPoolPosition,
    refreshBalances,
  ]);

  const handleModalActionButton = useCallback(() => {
    if (txnStatus !== TXN_STATUS.IDLE) {
      handleCloseModal();
    } else {
      addLiquidity();
    }
  }, [handleCloseModal, addLiquidity, txnStatus]);

  return (
    <div className="flex flex-col flex-1 mt-0 md:mt-12">
      <PriceRangeBlock
        symbols={[
          poolToken0?.token.coinDenom ?? "",
          poolToken1?.token.coinDenom ?? "",
        ]}
        selectedSymbol={selectedSymbol}
        handleReverseTokenData={handleReverseTokenData}
      />
      <div className="flex flex-col gap-4 mt-4">
        <TokenLiquidityBlock
          poolToken0={poolToken0}
          poolToken1={poolToken1}
          feeTier={feeTier}
        />
        <AddLiquidityInputsBlock
          input0={input0}
          input1={input1}
          token0={token0}
          token1={token1}
          token0Balance={token0Balance}
          token1Balance={token1Balance}
          handleInputChange={handleInputChange}
        />
        <div className="flex w-full gap-4">
          <div className="hidden md:block md:w-1/2" />
          <div className="w-full md:w-1/2">
            {!validPoolInputs && (
              <div className="flex items-center justify-center text-grey-light font-semibold px-4 py-3 rounded-xl bg-surface-1 mt-2">
                {buttonText}
              </div>
            )}
            {poolToken0 && poolToken1 && validPoolInputs && (
              <ConfirmationModal
                open={modalOpen}
                buttonText={"Add liquidity"}
                actionButtonText={
                  txnStatus !== TXN_STATUS.IDLE ? "Close" : "Add liquidity"
                }
                showOpenButton={true}
                handleOpenModal={() => setModalOpen(true)}
                handleModalActionButton={handleModalActionButton}
                handleCloseModal={handleCloseModal}
                title={"Add liquidity"}
              >
                <PoolTxnSteps
                  txnStatus={txnStatus}
                  poolTokens={[poolToken0, poolToken1]}
                  addLiquidityInputValues={[input0, input1]}
                  txnHash={txnHash}
                  txnMsg={errorText || ""}
                />
              </ConfirmationModal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
