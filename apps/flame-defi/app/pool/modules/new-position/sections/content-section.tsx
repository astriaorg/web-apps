"use client";

import { usePoolContext } from "pool/hooks";
import { EvmCurrency, TokenInputState, TXN_STATUS } from "@repo/flame-types";
import { useEvmChainData } from "config";
import { useState } from "react";
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
  const { feeData, modalOpen, setModalOpen, setTxnStatus, txnStatus } =
    usePoolContext();
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;
  const defaultFeeData = feeData[2] as FeeData;
  const [selectedFeeTier, setSelectedFeeTier] =
    useState<FeeData>(defaultFeeData);
  const [inputOne, setInputOne] = useState<TokenInputState>({
    token: currencies[0],
    value: "",
    isQuoteValue: false,
  });
  const [inputTwo, setInputTwo] = useState<TokenInputState>({
    token: null,
    value: "",
    isQuoteValue: true,
  });

  const feeTier = selectedFeeTier.feeTier / 1_000_000;

  return (
    <div className="flex flex-col md:flex-row gap-4 mt-0 md:mt-12 h-fit">
      <div className="flex flex-col gap-4 w-full md:w-1/2">
        <NewPositionInputs
          inputOne={inputOne}
          inputTwo={inputTwo}
          setInputOne={setInputOne}
          setInputTwo={setInputTwo}
          currencies={currencies}
        />
        <FeeRange
          selectedFeeTier={selectedFeeTier}
          setSelectedFeeTier={setSelectedFeeTier}
        />
      </div>
      <div className="flex flex-col gap-4 w-full md:w-1/2">
        <NewPositionPriceRange />
        <ConfirmationModal
          open={modalOpen}
          buttonText={"Create Position"}
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
          title={"New position"}
        >
          {inputOne.token && inputTwo.token && (
            <PoolTxnSteps
              txnStatus={txnStatus}
              poolTokens={[
                {
                  token: inputOne.token as EvmCurrency,
                  unclaimedFees: 0,
                  liquidity: 0,
                  liquidityPercentage: 0,
                },
                {
                  token: inputTwo.token as EvmCurrency,
                  unclaimedFees: 0,
                  liquidity: 0,
                  liquidityPercentage: 0,
                },
              ]}
              addLiquidityInputValues={[inputOne.value, inputTwo.value]}
              selectedFeeTier={formatNumber(feeTier, {
                style: "percent",
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              })}
              txnHash={""}
              txnMsg={""}
            />
          )}
        </ConfirmationModal>
      </div>
    </div>
  );
};
