"use client";

import {
  usePoolContext,
  useMintNewPosition,
  useAddLiquidityValidation,
  useGetPoolTokenBalances,
} from "pool/hooks";
import { EvmCurrency, TokenInputState, TXN_STATUS } from "@repo/flame-types";
import { useEvmChainData } from "config";
import { useState, useEffect, useCallback } from "react";
import {
  NewPositionInputs,
  NewPositionPriceRange,
  FeeRange,
} from "../components";
import { FeeData } from "pool/types";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { PoolTxnSteps } from "pool/components";
import { useIntl } from "react-intl";

export const ContentSection = () => {
  const { formatNumber } = useIntl();
  const { feeData, modalOpen, setModalOpen, maxPrice, updateMaxPrice } =
    usePoolContext();
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;
  const defaultFeeData = feeData[2] as FeeData;
  const [selectedFeeTier, setSelectedFeeTier] =
    useState<FeeData>(defaultFeeData);

  const [input0, setInput0] = useState<TokenInputState>({
    token: currencies[0],
    value: "",
    isQuoteValue: false,
  });
  const [input1, setInput1] = useState<TokenInputState>({
    token: null,
    value: "",
    isQuoteValue: true,
  });

  const { token0Balance, token1Balance } = useGetPoolTokenBalances(
    input0.token?.coinDenom || "",
    input1.token?.coinDenom || "",
  );

  const { validPoolInputs, buttonText } = useAddLiquidityValidation(
    input0.value,
    input1.value,
    token0Balance,
    token1Balance,
  );

  const { txnStatus, txnHash, setTxnStatus, mintNewPosition, errorText } =
    useMintNewPosition(input0, input1, selectedFeeTier);

  // Update max price when fee tier or tokens change
  useEffect(() => {
    if (input0.token && input1.token) {
      updateMaxPrice(
        selectedFeeTier.feeTier,
        input0.token.coinDecimals,
        input1.token.coinDecimals,
      );
    }
  }, [selectedFeeTier.feeTier, updateMaxPrice, input0.token, input1.token]);
  const displayFeeTier = selectedFeeTier.feeTier / 1_000_000;

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setTxnStatus(TXN_STATUS.IDLE);
    setInput0({
      token: currencies[0],
      value: "",
      isQuoteValue: false,
    });
    setInput1({
      token: null,
      value: "",
      isQuoteValue: true,
    });
  }, [setModalOpen, setInput0, setInput1, setTxnStatus, currencies]);

  const handleModalActionButton = useCallback(() => {
    if (txnStatus !== TXN_STATUS.IDLE) {
      handleCloseModal();
    } else {
      mintNewPosition();
    }
  }, [handleCloseModal, mintNewPosition, txnStatus]);

  return (
    <div className="flex flex-col md:flex-row gap-4 mt-0 md:mt-12 h-fit">
      <div className="flex flex-col gap-4 w-full md:w-1/2">
        <NewPositionInputs
          input0={input0}
          input1={input1}
          setInput0={setInput0}
          setInput1={setInput1}
          currencies={currencies}
          token0Balance={token0Balance}
          token1Balance={token1Balance}
        />
        <FeeRange
          selectedFeeTier={selectedFeeTier}
          setSelectedFeeTier={setSelectedFeeTier}
        />
      </div>
      <div className="flex flex-col gap-4 w-full md:w-1/2">
        <NewPositionPriceRange minPrice={"0"} maxPrice={maxPrice} />
        {!validPoolInputs && (
          <div className="flex items-center justify-center text-grey-light font-semibold px-4 py-3 rounded-xl bg-surface-1 mt-2">
            {buttonText}
          </div>
        )}
        {input0.token && input1.token && validPoolInputs && (
          <ConfirmationModal
            open={modalOpen}
            buttonText={"Create Position"}
            actionButtonText={
              txnStatus === TXN_STATUS.PENDING ? "Close" : "Add liquidity"
            }
            showOpenButton={true}
            handleOpenModal={() => setModalOpen(true)}
            handleModalActionButton={handleModalActionButton}
            handleCloseModal={() => setModalOpen(false)}
            title={"New position"}
          >
            <PoolTxnSteps
              txnStatus={txnStatus}
              poolTokens={[
                {
                  token: input0.token as EvmCurrency,
                  unclaimedFees: 0,
                  liquidity: 0,
                  liquidityPercentage: 0,
                },
                {
                  token: input1.token as EvmCurrency,
                  unclaimedFees: 0,
                  liquidity: 0,
                  liquidityPercentage: 0,
                },
              ]}
              addLiquidityInputValues={[input0.value, input1.value]}
              selectedFeeTier={formatNumber(displayFeeTier, {
                style: "percent",
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
              txnHash={txnHash}
              txnMsg={errorText || ""}
            />
          </ConfirmationModal>
        )}
      </div>
    </div>
  );
};
