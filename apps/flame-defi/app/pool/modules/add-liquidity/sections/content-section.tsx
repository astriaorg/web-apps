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
    symbols,
    refreshPoolPosition,
  } = usePoolPositionContext();
  const [inputOne, setInputOne] = useState<string>("");
  const [inputTwo, setInputTwo] = useState<string>("");
  const {
    tokenOne,
    tokenTwo,
    tokenOneBalance,
    tokenTwoBalance,
    refreshBalances,
  } = useGetPoolTokenBalances(
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
  } = useAddLiquidityTxn(inputOne, inputTwo);
  const { validPoolInputs, buttonText } = useAddLiquidityValidation(
    inputOne,
    inputTwo,
    tokenOneBalance,
    tokenTwoBalance,
  );

  const getTokenCalculatedTokenValue = useCallback(
    (value: string, sourceId: POOL_INPUT_ID, coinDecimals: number) => {
      if (!value || isNaN(Number(value)) || !currentPrice) return "";
      const numericValue = parseFloat(value);
      const numericPrice = parseFloat(currentPrice);

      const tokenValue =
        sourceId === POOL_INPUT_ID.INPUT_ONE
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
      if (id === POOL_INPUT_ID.INPUT_ONE) {
        setInputOne(value);
        setInputTwo(getTokenCalculatedTokenValue(value, id, coinDecimals));
      } else {
        setInputTwo(value);
        setInputOne(getTokenCalculatedTokenValue(value, id, coinDecimals));
      }
    },
    [getTokenCalculatedTokenValue, setErrorText],
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setTxnStatus(TXN_STATUS.IDLE);
    setInputOne("");
    setInputTwo("");
    refreshPoolPosition();
    refreshBalances();
  }, [
    setModalOpen,
    setInputOne,
    setInputTwo,
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
        symbols={symbols}
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
          inputOne={inputOne}
          inputTwo={inputTwo}
          tokenOne={tokenOne}
          tokenTwo={tokenTwo}
          tokenOneBalance={tokenOneBalance}
          tokenTwoBalance={tokenTwoBalance}
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
                  addLiquidityInputValues={[inputOne, inputTwo]}
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
