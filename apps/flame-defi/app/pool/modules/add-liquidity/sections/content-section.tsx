"use client";

import { useCallback } from "react";
import { useIntl } from "react-intl";

import { TransactionStatus } from "@repo/flame-types";
import { Card, CardContent, useTokenAmountInput } from "@repo/ui/components";
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { useEvmCurrencyBalance } from "features/evm-wallet";
import {
  PositionFeeBadge,
  PositionSummaryCard,
} from "pool/components/position";
import { PriceRangeSummary } from "pool/components/price-range-summary";
import {
  TokenPairCard,
  TokenPairCardDivider,
} from "pool/components/token-pair-card";
import {
  useAddLiquidityTransaction,
  usePoolContext,
  usePoolPositionContext,
} from "pool/hooks";
import { useGetPosition } from "pool/hooks/use-get-position";
import { usePoolPositionContext as usePoolPositionContextV2 } from "pool/hooks/use-pool-position-context-v2";
import { POOL_INPUT_ID } from "pool/types";

// TODO: Handle token approval. Shouldn't be an issue since we always set the approval to max on create position.
export const ContentSection = () => {
  const { formatNumber } = useIntl();
  const { modalOpen, setModalOpen } = usePoolContext();
  const {
    // token0,
    // token1,
    feeTier,
    currentPrice,
    selectedSymbol,
    handleReverseTokenData,
    refreshPoolPosition,
  } = usePoolPositionContext();

  const { tokenId, invert } = usePoolPositionContextV2();
  const { data, isPending, refetch } = useGetPosition({ tokenId, invert });

  const { balance: token0Balance, isLoading: isLoadingToken0Balance } =
    useEvmCurrencyBalance(data?.token0);
  const { balance: token1Balance, isLoading: isLoadingToken1Balance } =
    useEvmCurrencyBalance(data?.token1);

  const { amount: amount0, onInput: onInput0 } = useTokenAmountInput({
    balance: token0Balance?.value,
    minimum: "0",
    token: data?.token0
      ? {
          symbol: data.token0.coinDenom,
          decimals: data.token0.coinDecimals,
        }
      : undefined,
  });

  const { amount: amount1, onInput: onInput1 } = useTokenAmountInput({
    balance: token1Balance?.value,
    minimum: "0",
    token: data?.token1
      ? {
          symbol: data.token1.coinDenom,
          decimals: data.token1.coinDecimals,
        }
      : undefined,
  });

  const { status, hash, error, setError, setStatus, addLiquidity } =
    useAddLiquidityTransaction(amount0.value, amount1.value);

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
        onInput0({ value });
        onInput1({
          value: getTokenCalculatedTokenValue(value, id, coinDecimals),
        });
      } else {
        onInput1({ value });
        onInput0({
          value: getTokenCalculatedTokenValue(value, id, coinDecimals),
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getTokenCalculatedTokenValue, setError],
  );

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setStatus(TransactionStatus.IDLE);
    onInput0({ value: "" });
    onInput1({ value: "" });
    refreshPoolPosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setModalOpen, setStatus, refreshPoolPosition]);

  const handleModalActionButton = useCallback(() => {
    if (status !== TransactionStatus.IDLE) {
      handleCloseModal();
    } else {
      void addLiquidity();
    }
  }, [handleCloseModal, addLiquidity, status]);

  return (
    <section className="flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PositionSummaryCard
          token0={data?.token0}
          token1={data?.token1}
          position={data?.position}
          isLoading={isPending}
        />

        <Card className="col-span-1 md:col-span-2">
          <CardContent>
            <TokenPairCard
              token0={data?.token0}
              token1={data?.token1}
              value0={formatNumber(Number(data?.amount0 ?? 0), {
                maximumFractionDigits: data?.token0?.coinDecimals,
              })}
              value1={formatNumber(Number(data?.amount1 ?? 0), {
                maximumFractionDigits: data?.token1?.coinDecimals,
              })}
              isLoading={isPending}
            />
            <TokenPairCardDivider />
            <div className="flex text-sm font-medium text-typography-light">
              <span className="flex-1">Fee Tier</span>
              {data?.position && (
                <PositionFeeBadge
                  position={data?.position}
                  className="p-0 bg-transparent text-initial"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <PriceRangeSummary />
      <div className="flex flex-col gap-4 mt-4">
        {/* <TokenLiquidityBlock
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
        /> */}
        <div className="flex w-full gap-4">
          <div className="hidden md:block md:w-1/2" />
          <div className="w-full md:w-1/2">
            {(!amount0.validation.isValid || !amount1.validation.isValid) && (
              <div className="flex items-center justify-center text-grey-light font-semibold px-4 py-3 rounded-xl bg-surface-1 mt-2">
                :-(
              </div>
            )}
            {data?.token0 &&
              data?.token1 &&
              amount0.validation.isValid &&
              amount1.validation.isValid && (
                <ConfirmationModal
                  open={modalOpen}
                  buttonText={"Add liquidity"}
                  actionButtonText={
                    status !== TransactionStatus.IDLE
                      ? "Close"
                      : "Add liquidity"
                  }
                  showOpenButton={true}
                  handleOpenModal={() => setModalOpen(true)}
                  handleModalActionButton={handleModalActionButton}
                  handleCloseModal={handleCloseModal}
                  title={"Add liquidity"}
                >
                  {/* <PoolTransactionSteps
                  status={status}
                  tokens={[token0, token1]}
                  addLiquidityInputValues={[input0, input1]}
                  hash={hash}
                  message={error || ""}
                /> */}
                </ConfirmationModal>
              )}
          </div>
        </div>
      </div>
    </section>
  );
};
