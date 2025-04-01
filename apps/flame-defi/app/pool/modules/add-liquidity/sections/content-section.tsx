"use client";

import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { TokenLiquidityBlock, AddLiquidityInputsBlock } from "../components";
import { PoolTxnSteps, PriceRangeBlock } from "pool/components";
import { TXN_STATUS } from "@repo/flame-types";
import { useAddLiquidityTxn, usePoolContext, usePoolPositionContext } from "pool/hooks";
import { useCallback, useState } from "react";
import { POOL_INPUT_ID } from "pool/types";

export const ContentSection = () => {
  const { modalOpen, setModalOpen, setTxnStatus, txnStatus } = usePoolContext();
  const {
    poolTokenOne,
    poolTokenTwo,
    feeTier,
    currentPrice,
    selectedSymbol,
    handleReverseTokenData,
    symbols,
  } = usePoolPositionContext();
  const [inputOne, setInputOne] = useState<string>("");
  const [inputTwo, setInputTwo] = useState<string>("");

  const { addLiquidity } = useAddLiquidityTxn(inputOne, inputTwo);

  // TODO: Where does the gas cost estimate come from? Do I need to factor it in here?
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
    [currentPrice]
  );

  const handleInputChange = useCallback(
    (value: string, id: POOL_INPUT_ID, coinDecimals?: number) => {
      if (!coinDecimals) return;

      if (id === POOL_INPUT_ID.INPUT_ONE) {
        setInputOne(value);
        setInputTwo(getTokenCalculatedTokenValue(value, id, coinDecimals));
      } else {
        setInputTwo(value);
        setInputOne(getTokenCalculatedTokenValue(value, id, coinDecimals));
      }
    },
    [getTokenCalculatedTokenValue]
  );

  return (
    <div className="flex flex-col flex-1 mt-0 md:mt-12">
      <PriceRangeBlock
        symbols={symbols}
        selectedSymbol={selectedSymbol}
        handleReverseTokenData={handleReverseTokenData}
      />
      <div className="flex flex-col gap-4 mt-4">
        <TokenLiquidityBlock
          poolTokenOne={poolTokenOne}
          poolTokenTwo={poolTokenTwo}
          feeTier={feeTier}
        />
        <AddLiquidityInputsBlock
          inputOne={inputOne}
          inputTwo={inputTwo}
          poolTokenOneSymbol={poolTokenOne?.symbol ?? ""}
          poolTokenTwoSymbol={poolTokenTwo?.symbol ?? ""}
          handleInputChange={handleInputChange}
        />
        <div className="flex w-full gap-4">
          <div className="hidden md:block md:w-1/2" />
          <div className="w-full md:w-1/2">
            {poolTokenOne && poolTokenTwo && (
              <ConfirmationModal
                open={modalOpen}
                buttonText={"Add liquidity"}
                actionButtonText={
                  txnStatus === TXN_STATUS.PENDING ? "Close" : "Add liquidity"
                }
                showOpenButton={true}
                handleOpenModal={() => setModalOpen(true)}
                handleModalActionButton={addLiquidity}
                handleCloseModal={() => setModalOpen(false)}
                title={"Add liquidity"}
              >
                <PoolTxnSteps
                  txnStatus={txnStatus}
                  poolTokens={[poolTokenOne, poolTokenTwo]}
                  addLiquidityInputValues={[inputOne, inputTwo]}
                  txnHash={""}
                  txnMsg={""}
                />
              </ConfirmationModal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
