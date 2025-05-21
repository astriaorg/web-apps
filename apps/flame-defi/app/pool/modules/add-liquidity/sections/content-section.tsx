"use client";

import { useCallback, useState } from "react";

import { TransactionStatus } from "@repo/flame-types";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { useEvmCurrencyBalance } from "features/evm-wallet";
import { PoolTransactionSteps, PriceRangeBlock } from "pool/components";
import {
  useAddLiquidityTransaction,
  useAddLiquidityValidation,
  usePoolContext,
  usePoolPositionContext,
} from "pool/hooks";
import { POOL_INPUT_ID } from "pool/types";

import { AddLiquidityInputsBlock, TokenLiquidityBlock } from "../components";

export const ContentSection = () => {
  const { modalOpen, setModalOpen } = usePoolContext();
  const {
    token0,
    token1,
    feeTier,
    currentPrice,
    selectedSymbol,
    handleReverseTokenData,
    refreshPoolPosition,
  } = usePoolPositionContext();

  const [input0, setInput0] = useState<string>("");
  const [input1, setInput1] = useState<string>("");

  const { balance: token0Balance } = useEvmCurrencyBalance(token0?.token);
  const { balance: token1Balance } = useEvmCurrencyBalance(token1?.token);

  const { status, hash, error, setError, setStatus, addLiquidity } =
    useAddLiquidityTransaction(input0, input1);
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
      setError(null);
      if (id === POOL_INPUT_ID.INPUT_ZERO) {
        setInput0(value);
        setInput1(getTokenCalculatedTokenValue(value, id, coinDecimals));
      } else {
        setInput1(value);
        setInput0(getTokenCalculatedTokenValue(value, id, coinDecimals));
      }
    },
    [getTokenCalculatedTokenValue, setError],
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setStatus(TransactionStatus.IDLE);
    setInput0("");
    setInput1("");
    refreshPoolPosition();
  }, [setModalOpen, setInput0, setInput1, setStatus, refreshPoolPosition]);

  const handleModalActionButton = useCallback(() => {
    if (status !== TransactionStatus.IDLE) {
      handleCloseModal();
    } else {
      void addLiquidity();
    }
  }, [handleCloseModal, addLiquidity, status]);

  return (
    <div className="flex flex-col flex-1 mt-0 md:mt-12">
      <PriceRangeBlock
        symbols={[token0?.token.coinDenom ?? "", token1?.token.coinDenom ?? ""]}
        selectedSymbol={selectedSymbol}
        handleReverseTokenData={handleReverseTokenData}
      />
      <div className="flex flex-col gap-4 mt-4">
        <TokenLiquidityBlock
          token0={token0}
          token1={token1}
          feeTier={feeTier}
        />
        <AddLiquidityInputsBlock
          input0={input0}
          input1={input1}
          token0={token0?.token}
          token1={token1?.token}
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
            {token0 && token1 && validPoolInputs && (
              <ConfirmationModal
                open={modalOpen}
                buttonText={"Add liquidity"}
                actionButtonText={
                  status !== TransactionStatus.IDLE ? "Close" : "Add liquidity"
                }
                showOpenButton={true}
                handleOpenModal={() => setModalOpen(true)}
                handleModalActionButton={handleModalActionButton}
                handleCloseModal={handleCloseModal}
                title={"Add liquidity"}
              >
                <PoolTransactionSteps
                  status={status}
                  tokens={[token0, token1]}
                  addLiquidityInputValues={[input0, input1]}
                  hash={hash}
                  message={error || ""}
                />
              </ConfirmationModal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
