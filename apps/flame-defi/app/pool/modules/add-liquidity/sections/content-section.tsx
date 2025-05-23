"use client";

import Big from "big.js";
import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useAccount } from "wagmi";

import { type EvmCurrency, TransactionStatus } from "@repo/flame-types";
import {
  type Amount,
  Button,
  Card,
  CardContent,
  Skeleton,
  useTokenAmountInput,
} from "@repo/ui/components";
import { useValidateTokenAmount } from "@repo/ui/hooks";
import {
  formatNumberWithoutTrailingZeros,
  getSlippageTolerance,
} from "@repo/ui/utils";
import { ConfirmationModal } from "components/confirmation-modal-v2";
import { useAstriaChainData, useConfig } from "config";
import { useEvmCurrencyBalance } from "features/evm-wallet";
import {
  PositionFeeBadge,
  PositionSummaryCard,
} from "pool/components/position";
import { PriceRangeSummary } from "pool/components/price-range";
import {
  TokenPairCard,
  TokenPairCardDivider,
} from "pool/components/token-pair-card";
import {
  TransactionSummary,
  TransactionType,
} from "pool/components/transaction-summary";
import { useAddLiquidity } from "pool/hooks/use-add-liquidity";
import { useGetPosition } from "pool/hooks/use-get-position";
import { usePoolPositionContext as usePoolPositionContextV2 } from "pool/hooks/use-pool-position-context-v2";
import { TokenAmountInput } from "pool/modules/add-liquidity/components/token-amount-input";
import { DepositType, InputId } from "pool/types";
import { getTransactionAmounts } from "pool/utils";

// TODO: Handle token approval. Shouldn't be an issue since we always set the approval to max on create position.
export const ContentSection = () => {
  const { formatNumber } = useIntl();
  const { chain } = useAstriaChainData();
  const { address } = useAccount();
  const { defaultSlippageTolerance } = useConfig();
  const slippageTolerance = getSlippageTolerance() || defaultSlippageTolerance;
  const validate = useValidateTokenAmount();

  const { tokenId, invert, hash, setHash, error, setError, status, setStatus } =
    usePoolPositionContextV2();
  const { data, isPending, refetch } = useGetPosition({ tokenId, invert });
  const { addLiquidity } = useAddLiquidity();

  const [currentInput, setCurrentInput] = useState<InputId>(InputId.INPUT_0);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);

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

  const derivedValues = useMemo((): {
    derivedAmount0: Amount;
    derivedAmount1: Amount;
  } => {
    if (isPending || !data) {
      return {
        derivedAmount0: amount0,
        derivedAmount1: amount1,
      };
    }

    const { token0, token1, price } = data;

    // TODO: Unify with create position logic.
    const getDerivedAmount = (
      amount: string,
      token: EvmCurrency,
      balance?: string,
    ): Amount => {
      return {
        value: amount,
        validation: validate({
          value: amount,
          token: {
            symbol: token.coinDenom,
            decimals: token.coinDecimals,
          },
          decimals: token.coinDecimals,
          minimum: "0",
          maximum: balance,
        }),
      };
    };

    if (currentInput === InputId.INPUT_0 && amount0.value) {
      const derivedAmount1 = new Big(amount0.value)
        .mul(new Big(1).div(price)) // TODO: Invert price to match create position logic.
        .toFixed(token1.coinDecimals);
      return {
        derivedAmount0: amount0,
        derivedAmount1: getDerivedAmount(
          formatNumberWithoutTrailingZeros(derivedAmount1),
          token1,
          token1Balance?.value,
        ),
      };
    }

    if (currentInput === InputId.INPUT_1 && amount1.value) {
      const derivedAmount0 = new Big(amount1.value)
        .mul(price)
        .toFixed(token0.coinDecimals);
      return {
        derivedAmount0: getDerivedAmount(
          formatNumberWithoutTrailingZeros(derivedAmount0),
          token0,
          token0Balance?.value,
        ),
        derivedAmount1: amount1,
      };
    }

    return {
      derivedAmount0: getDerivedAmount("", token0, token0Balance?.value),
      derivedAmount1: getDerivedAmount("", token1, token1Balance?.value),
    };
  }, [
    data,
    isPending,
    currentInput,
    amount0,
    amount1,
    token0Balance,
    token1Balance,
    validate,
  ]);

  const handleCloseConfirmationModal = useCallback(() => {
    setIsConfirmationModalOpen(false);
    setStatus(TransactionStatus.IDLE);
    refetch();
    setError(undefined);
  }, [refetch, setIsConfirmationModalOpen, setStatus, setError]);

  const handleOpenConfirmationModal = useCallback(() => {
    setIsConfirmationModalOpen(true);
    setStatus(TransactionStatus.IDLE);
  }, [setStatus]);

  const handleSubmit = useCallback(async () => {
    if (!data || !address) {
      handleCloseConfirmationModal();
      return;
    }

    const { token0, token1 } = data;

    setStatus(TransactionStatus.PENDING);

    try {
      const {
        amount0Min,
        amount1Min,
        amount0Desired,
        amount1Desired,
        deadline,
      } = getTransactionAmounts({
        amount0: amount0.value,
        amount1: amount1.value,
        token0,
        token1,
        depositType: data.depositType,
        slippageTolerance,
      });

      console.log(
        amount0Min,
        amount1Min,
        amount0Desired,
        amount1Desired,
        deadline,
      );

      const hash = await addLiquidity({
        chainId: chain.chainId,
        token0,
        token1,
        tokenId,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        deadline,
      });

      setHash(hash);
      setStatus(TransactionStatus.SUCCESS);
    } catch {
      setStatus(TransactionStatus.FAILED);
    }
  }, [
    data,
    amount0,
    amount1,
    address,
    tokenId,
    chain.chainId,
    slippageTolerance,
    handleCloseConfirmationModal,
    addLiquidity,
    setHash,
    setStatus,
  ]);

  const isDisabled = useMemo(() => {
    return (
      isPending ||
      !data ||
      !address ||
      !derivedValues.derivedAmount0.validation.isValid ||
      !derivedValues.derivedAmount1.validation.isValid
    );
  }, [isPending, data, address, derivedValues]);

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

      <div className="font-semibold mt-6">Add More Liquidity</div>
      <div className="flex flex-col md:flex-row gap-6 mt-3">
        {(data?.depositType === DepositType.BOTH ||
          data?.depositType === DepositType.TOKEN_0_ONLY) && (
          <Skeleton isLoading={isPending}>
            <TokenAmountInput
              value={derivedValues.derivedAmount0.value}
              onInput={({ value }) => {
                onInput0({ value });
                setCurrentInput(InputId.INPUT_0);
              }}
              token={data?.token0}
              balance={token0Balance}
              isLoading={isLoadingToken0Balance}
            />
          </Skeleton>
        )}
        {(data?.depositType === DepositType.BOTH ||
          data?.depositType === DepositType.TOKEN_1_ONLY) && (
          <Skeleton isLoading={isPending}>
            <TokenAmountInput
              value={derivedValues.derivedAmount1.value}
              onInput={({ value }) => {
                onInput1({ value });
                setCurrentInput(InputId.INPUT_1);
              }}
              token={data?.token1}
              balance={token1Balance}
              isLoading={isLoadingToken1Balance}
            />
          </Skeleton>
        )}
      </div>

      <Button
        onClick={handleOpenConfirmationModal}
        disabled={isDisabled}
        className="mt-6 w-full"
      >
        Add Liquidity
      </Button>

      {data && (
        <ConfirmationModal
          title="Add Liquidity"
          open={isConfirmationModalOpen}
          onOpenChange={(value) => setIsConfirmationModalOpen(value)}
        >
          <TransactionSummary
            type={TransactionType.ADD_LIQUIDITY}
            position={data.position}
            token0={data.token0}
            token1={data.token1}
            hash={hash}
            status={status}
            error={error}
            onSubmit={handleSubmit}
            amount0={amount0.value}
            amount1={amount1.value}
            minPrice={data.minPrice}
            maxPrice={data.maxPrice}
          />
        </ConfirmationModal>
      )}
    </section>
  );
};
