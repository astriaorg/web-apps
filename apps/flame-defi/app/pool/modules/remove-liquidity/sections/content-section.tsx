"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useAccount } from "wagmi";

import { TransactionStatus } from "@repo/flame-types";
import { Button, Card, CardContent, Switch } from "@repo/ui/components";
import { getSlippageTolerance } from "@repo/ui/utils";
import { ConfirmationModal } from "components/confirmation-modal-v2";
import { useAstriaChainData, useConfig } from "config";
import { PositionSummaryCard } from "pool/components/position";
import { TokenPairCard } from "pool/components/token-pair-card";
import {
  TransactionSummary,
  TransactionType,
} from "pool/components/transaction-summary";
import { useGetPosition } from "pool/hooks/use-get-position";
import { usePoolPositionContext as usePoolPositionContextV2 } from "pool/hooks/use-pool-position-context-v2";
import { useRemoveLiquidity } from "pool/hooks/use-remove-liquidity";
import { RemoveAmountSlider } from "pool/modules/remove-liquidity/components/remove-amount-slider";

export const ContentSection = () => {
  const router = useRouter();
  const { formatNumber } = useIntl();
  const { chain } = useAstriaChainData();
  const { address } = useAccount();
  const { defaultSlippageTolerance } = useConfig();
  const slippageTolerance = getSlippageTolerance() || defaultSlippageTolerance;

  const {
    positionId,
    invert,
    hash,
    setHash,
    error,
    setError,
    status,
    setStatus,
  } = usePoolPositionContextV2();
  const { data, isPending, refetch } = useGetPosition({
    positionId,
    invert,
  });
  const { removeLiquidity } = useRemoveLiquidity();

  const [isCollectAsWrappedNative, setIsCollectAsWrappedNative] =
    useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);

  // const {
  //   token0,
  //   token1,
  //   isCollectAsWrappedNative,
  //   handleCollectAsWrappedNative,
  //   refreshPoolPosition,
  // } = usePoolPositionContext();
  // const {
  //   liquidityToRemove,
  //   handlePercentToRemove,
  //   percentageToRemove,
  //   refreshLiquidityToRemove,
  // } = useRemoveLiquidityPercentage();
  // const { hash, status, setStatus, error, setError, removeLiquidity } =
  //   useRemoveLiquidityTransaction(
  //     liquidityToRemove,
  //     isCollectAsWrappedNative,
  //     percentageToRemove,
  //   );
  // const poolContainsNativeOrWrappedToken =
  //   token0?.token.isNative ||
  //   token1?.token.isNative ||
  //   token0?.token.isWrappedNative ||
  //   token1?.token.isWrappedNative;

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
      // const {
      //   amount0Min,
      //   amount1Min,
      //   amount0Desired,
      //   amount1Desired,
      //   deadline,
      // } = getTransactionAmounts({
      //   amount0: derivedValues.derivedAmount0.value,
      //   amount1: derivedValues.derivedAmount1.value,
      //   token0,
      //   token1,
      //   depositType: data.depositType,
      //   slippageTolerance,
      // });

      // const hash = await addLiquidity({
      //   chainId: chain.chainId,
      //   token0,
      //   token1,
      //   tokenId: positionId,
      //   amount0Desired,
      //   amount1Desired,
      //   amount0Min,
      //   amount1Min,
      //   deadline,
      // });

      setHash(hash);
      setStatus(TransactionStatus.SUCCESS);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error);
      }
      setStatus(TransactionStatus.FAILED);
    }
  }, [
    data,
    address,
    positionId,
    chain.chainId,
    slippageTolerance,
    removeLiquidity,
    handleCloseConfirmationModal,
    setHash,
    setError,
    setStatus,
  ]);

  const isDisabled = useMemo(() => {
    return isPending || !data || !address;
  }, [isPending, data, address]);

  return (
    <section className="flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PositionSummaryCard
          token0={data?.token0}
          token1={data?.token1}
          position={data?.position}
          price={data?.price}
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
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between h-6 mt-6">
        <div className="font-semibold">Amount to Remove</div>
        {data && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Collect as WTIA</span>
            <Switch
              checked={isCollectAsWrappedNative}
              onCheckedChange={() =>
                setIsCollectAsWrappedNative((value) => !value)
              }
            />
          </div>
        )}
      </div>

      <Card variant="secondary" className="mt-4">
        <CardContent>
          <RemoveAmountSlider onChange={() => {}} />
        </CardContent>
      </Card>

      <Button
        onClick={handleOpenConfirmationModal}
        disabled={isDisabled}
        className="mt-6 w-full"
      >
        Remove Liquidity
      </Button>

      {data && (
        <ConfirmationModal
          title="Remove Liquidity"
          open={isConfirmationModalOpen}
          onOpenChange={(value) => {
            if (!value && status === TransactionStatus.SUCCESS) {
              router.push(`/pool/${positionId}`);
              return;
            }
            setIsConfirmationModalOpen(value);
          }}
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
            amount0={"0"}
            amount1={"0"}
            minPrice={data.minPrice}
            maxPrice={data.maxPrice}
          />
        </ConfirmationModal>
      )}
    </section>
  );

  /*
  return (
    <div className="flex flex-col flex-1 mt-0 md:mt-12">
      <div className="flex flex-col gap-4 mt-4">
        <TokenLiquidityBlock liquidityToRemove={liquidityToRemove} />
        <div className="flex items-center justify-between mt-8">
          <h2 className="text-lg font-medium">Amount to Remove</h2>

          {poolContainsNativeOrWrappedToken && (
            <div className="flex items-center gap-2">
              <span className="text-sm">Collect as WTIA</span>
              <Switch
                checked={isCollectAsWrappedNative}
                onCheckedChange={() =>
                  handleCollectAsWrappedNative(!isCollectAsWrappedNative)
                }
                className="h-7 w-12 data-[state=unchecked]:bg-grey-light data-[state=checked]:bg-orange [&>span]:h-6 [&>span]:w-6 [&>span[data-state=checked]]:translate-x-5"
              />
            </div>
          )}
        </div>
        <div className="flex gap-4 w-full bg-surface-1 rounded-lg p-4">
          <RemoveAmountSlider handlePercentToRemove={handlePercentToRemove} />
        </div>
        <div className="flex w-full gap-4">
          <div className="hidden md:block md:w-1/2" />
          <div className="w-full md:w-1/2">
            <ConfirmationModal
              open={modalOpen}
              buttonText={"Remove liquidity"}
              actionButtonText={
                status !== TransactionStatus.IDLE ? "Close" : "Remove liquidity"
              }
              showOpenButton={true}
              handleOpenModal={() => setModalOpen(true)}
              handleModalActionButton={handleModalActionButton}
              handleCloseModal={handleCloseModal}
              title={"Remove liquidity"}
            >
              <PoolTransactionSteps
                status={status}
                tokens={liquidityToRemove}
                hash={hash}
                message={error ?? ""}
                addLiquidityInputValues={null}
              />
            </ConfirmationModal>
          </div>
        </div>
      </div>
    </div>
  );*/
};
