"use client";

import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";

import { TransactionStatus } from "@repo/flame-types";
import {
  Button,
  Card,
  CardContent,
  useTokenAmountInput,
} from "@repo/ui/components";
import { getSlippageTolerance } from "@repo/ui/utils";
import { ConfirmationModal } from "components/confirmation-modal-v2";
import { useAstriaChainData, useConfig } from "config";
import { useEvmCurrencyBalance } from "features/evm-wallet";
import { getMaxBigInt } from "features/evm-wallet/services";
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
  TransactionSummary,
  TransactionType,
} from "pool/components/transaction-summary";
import { useAddLiquidity } from "pool/hooks/use-add-liquidity";
import { useGetPosition } from "pool/hooks/use-get-position";
import { usePoolPositionContext as usePoolPositionContextV2 } from "pool/hooks/use-pool-position-context-v2";
import { TokenAmountInput } from "pool/modules/add-liquidity/components/token-amount-input";

// TODO: Handle token approval. Shouldn't be an issue since we always set the approval to max on create position.
export const ContentSection = () => {
  const { formatNumber } = useIntl();
  const { chain } = useAstriaChainData();
  const { address } = useAccount();
  const { defaultSlippageTolerance } = useConfig();
  const slippageTolerance = getSlippageTolerance() || defaultSlippageTolerance;

  const { tokenId, invert, hash, setHash, error, setError, status, setStatus } =
    usePoolPositionContextV2();
  const { data, isPending, refetch } = useGetPosition({ tokenId, invert });

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

  const { addLiquidity } = useAddLiquidity();

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

    try {
      setStatus(TransactionStatus.PENDING);

      const amount0Desired = parseUnits(
        amount0.value || "0",
        token0.coinDecimals,
      );
      const amount1Desired = parseUnits(
        amount1.value || "0",
        token1.coinDecimals,
      );

      /**
       * TODO: Use slippage calculation in `TokenAmount` class.
       * Too bulky to use here for now, wait until the class is refactored to implement it.
       */
      const calculateAmountWithSlippage = (amount: bigint) => {
        // Convert slippage to basis points (1 bp = 0.01%)
        // Example: 0.1% = 10 basis points
        const basisPoints = Math.round(slippageTolerance * 100);

        // Calculate: amount * (10000 - basisPoints) / 10000
        return (amount * BigInt(10000 - basisPoints)) / BigInt(10000);
      };

      const amount0Min = calculateAmountWithSlippage(amount0Desired);
      const amount1Min = calculateAmountWithSlippage(amount1Desired);

      // 20 minute deadline.
      // TODO: Add this to settings.
      const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

      const hash = await addLiquidity({
        chainId: chain.chainId,
        token0,
        token1,
        tokenId,
        amount0Desired: getMaxBigInt(amount0Desired, BigInt(1)),
        amount1Desired: getMaxBigInt(amount1Desired, BigInt(1)),
        amount0Min: getMaxBigInt(amount0Min, BigInt(1)),
        amount1Min: getMaxBigInt(amount1Min, BigInt(1)),
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
        <TokenAmountInput
          value={amount0.value}
          onInput={onInput0}
          token={data?.token0}
          balance={token0Balance}
          isLoading={isLoadingToken0Balance}
        />
        <TokenAmountInput
          value={amount1.value}
          onInput={onInput1}
          token={data?.token1}
          balance={token1Balance}
          isLoading={isLoadingToken1Balance}
        />
      </div>

      <Button
        onClick={handleOpenConfirmationModal}
        disabled={isPending}
        className="mt-6 w-full"
      >
        Add Liquidity
      </Button>

      {data && (
        <ConfirmationModal
          title="Collect Fees"
          open={isConfirmationModalOpen}
          onOpenChange={(value) => setIsConfirmationModalOpen(value)}
        >
          <TransactionSummary
            position={data.position}
            token0={data.token0}
            token1={data.token1}
            unclaimedFees0={data.unclaimedFees0}
            unclaimedFees1={data.unclaimedFees1}
            type={TransactionType.ADD_LIQUIDITY}
            hash={hash}
            status={status}
            error={error}
            onSubmit={handleSubmit}
          />
        </ConfirmationModal>
      )}
    </section>
  );
};
