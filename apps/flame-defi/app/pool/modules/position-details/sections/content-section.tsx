"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { useAccount } from "wagmi";

import { TransactionStatus } from "@repo/flame-types";
import { Button, Card, CardContent } from "@repo/ui/components";
import { ConfirmationModal } from "components/confirmation-modal-v2";
import { useAstriaChainData } from "config";
import { PriceRangeSummary } from "pool/components/price-range";
import {
  TokenPairCard,
  TokenPairCardDivider,
} from "pool/components/token-pair-card";
import {
  TransactionSummary,
  TransactionType,
} from "pool/components/transaction-summary";
import { ROUTES } from "pool/constants/routes";
import { useCollectFees } from "pool/hooks/use-collect-fees";
import { useGetPosition } from "pool/hooks/use-get-position";
import { usePoolPositionContext } from "pool/hooks/use-pool-position-context";

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
  } = usePoolPositionContext();
  const { data, isPending, refetch } = useGetPosition({
    positionId,
    invert,
  });

  const { collectFees } = useCollectFees();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCollectAsWrappedNative, setIsCollectAsWrappedNative] =
    useState<boolean>(true);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);

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

    setStatus(TransactionStatus.PENDING);

    try {
      const hash = await collectFees({
        chainId: chain.chainId,
        tokenId: positionId,
        token0: data.token0,
        token1: data.token1,
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
    handleCloseConfirmationModal,
    collectFees,
    data,
    address,
    positionId,
    chain.chainId,
    isCollectAsWrappedNative,
    setHash,
    setError,
    setStatus,
  ]);

  return (
    <section className="flex flex-col">
      <Card>
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
            title={
              <div className="flex items-center justify-between h-5">
                <span className="">Unclaimed Fees</span>
                {/* TODO: Implement disabling collect as wrapped native. */}
                {/* {data?.hasUnclaimedFees && (
                  <div className="flex items-center gap-2 justify-end">
                    <span className="normal-case tracking-normal">
                      Collect as WTIA
                    </span>
                    <Switch
                      checked={isCollectAsWrappedNative}
                      onCheckedChange={() =>
                        setIsCollectAsWrappedNative((value) => !value)
                      }
                    />
                  </div>
                )} */}
              </div>
            }
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
          <Button
            onClick={handleOpenConfirmationModal}
            disabled={isPending || !data?.hasUnclaimedFees}
            className="mt-5 w-full"
          >
            Collect Fees
          </Button>
        </CardContent>
      </Card>

      <PriceRangeSummary />

      {data && (
        <ConfirmationModal
          title="Collect Fees"
          open={isConfirmationModalOpen}
          onOpenChange={(value) => {
            if (!value && status === TransactionStatus.SUCCESS) {
              router.push(ROUTES.POSITION_LIST);
              return;
            }
            setIsConfirmationModalOpen(value);
          }}
        >
          <TransactionSummary
            type={TransactionType.COLLECT_FEES}
            position={data.position}
            token0={data.token0}
            token1={data.token1}
            hash={hash}
            status={status}
            error={error}
            onSubmit={handleSubmit}
            unclaimedFees0={data.unclaimedFees0}
            unclaimedFees1={data.unclaimedFees1}
          />
        </ConfirmationModal>
      )}
    </section>
  );
};
