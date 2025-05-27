"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";

import { TransactionStatus } from "@repo/flame-types";
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Switch,
} from "@repo/ui/components";
import { ConfirmationModal } from "components/confirmation-modal-v2";
import { useAstriaChainData } from "config";
import { PositionSummaryCard } from "pool/components/position";
import {
  TokenPairCard,
  TokenPairCardDivider,
} from "pool/components/token-pair-card";
import {
  TransactionSummary,
  TransactionType,
} from "pool/components/transaction-summary";
import { useGetPosition } from "pool/hooks/use-get-position";
import { usePoolPositionContext as usePoolPositionContextV2 } from "pool/hooks/use-pool-position-context-v2";
import { useRemoveLiquidity } from "pool/hooks/use-remove-liquidity";
import { RemoveAmountSlider } from "pool/modules/remove-liquidity/components/remove-amount-slider";
import { getDecreaseLiquidityAmounts } from "pool/utils";

const LIQUIDITY_PERCENTAGES = [0, 25, 50, 75, 100];

export const ContentSection = () => {
  const router = useRouter();
  const { formatNumber } = useIntl();
  const { chain } = useAstriaChainData();
  const { address } = useAccount();

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
  const [sliderValue, setSliderValue] = useState<number>(
    LIQUIDITY_PERCENTAGES[1] as number,
  );

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
      const { amount0Min, amount1Min, deadline } = getDecreaseLiquidityAmounts({
        amount0: BigInt(parseUnits(data.amount0, token0.coinDecimals)),
        amount1: BigInt(parseUnits(data.amount1, token1.coinDecimals)),
        percentage: sliderValue,
      });

      const hash = await removeLiquidity({
        chainId: chain.chainId,
        token0,
        token1,
        tokenId: positionId,
        // Scale liquidity by percentage slider value.
        liquidity: (data.position.liquidity * BigInt(sliderValue)) / 100n,
        amount0Min,
        amount1Min,
        deadline,
        recipient: address,
        position: data.position,
        options: {
          isCollectAsWrappedNative,
        },
      });

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
    sliderValue,
    isCollectAsWrappedNative,
    removeLiquidity,
    handleCloseConfirmationModal,
    setHash,
    setError,
    setStatus,
  ]);

  const isDisabled = useMemo(() => {
    return isPending || !data || !address || sliderValue === 0;
  }, [isPending, data, address, sliderValue]);

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
              title="Liquidity"
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
            <TokenPairCard
              title="Unclaimed Fees"
              token0={data?.token0}
              token1={data?.token1}
              value0={formatNumber(Number(data?.unclaimedFees0 ?? 0), {
                maximumFractionDigits: data?.token0?.coinDecimals,
              })}
              value1={formatNumber(Number(data?.unclaimedFees1 ?? 0), {
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
          {data ? (
            <RemoveAmountSlider
              value={sliderValue}
              onChange={setSliderValue}
              breakpoints={LIQUIDITY_PERCENTAGES}
            />
          ) : (
            <Skeleton className="h-46 md:h-29" />
          )}
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
            type={TransactionType.REMOVE_LIQUIDITY}
            position={data.position}
            token0={data.token0}
            token1={data.token1}
            hash={hash}
            status={status}
            error={error}
            onSubmit={handleSubmit}
            percentage={sliderValue}
            amount0={data.amount0}
            amount1={data.amount1}
          />
        </ConfirmationModal>
      )}
    </section>
  );
};
