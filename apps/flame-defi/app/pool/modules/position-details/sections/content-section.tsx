"use client";

import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { type Address } from "viem";
import { useAccount } from "wagmi";

import { TransactionStatus } from "@repo/flame-types";
import { Button, Card, CardContent, Switch } from "@repo/ui/components";
import { ConfirmationModal } from "components/confirmation-modal-v2";
import { useAstriaChainData } from "config";
import { PriceRangeSummary } from "pool/components/price-range-summary";
import { TokenPairCard } from "pool/components/token-pair-card";
import { TransactionSummary } from "pool/components/transaction-summary";
import { TransactionType } from "pool/components/transaction-summary/transaction-summary.types";
import { useCollectFees } from "pool/hooks/use-collect-fees";
import { useGetPosition } from "pool/hooks/use-get-position";
import { usePoolPositionContext as usePoolPositionContextV2 } from "pool/hooks/use-pool-position-context-v2";

export const ContentSection = () => {
  const { formatNumber } = useIntl();
  const { chain } = useAstriaChainData();
  const { address } = useAccount();

  const { tokenId, invert } = usePoolPositionContextV2();
  const { data, isPending, refetch } = useGetPosition({ tokenId, invert });

  const { collectFees } = useCollectFees();

  const [error, setError] = useState<string | null>(null);

  const [hash, setHash] = useState<Address | null>(null);
  const [status, setStatus] = useState<TransactionStatus>(
    TransactionStatus.IDLE,
  );

  const [isCollectAsWrappedNative, setIsCollectAsWrappedNative] =
    useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);

  const handleCloseConfirmationModal = useCallback(() => {
    setIsConfirmationModalOpen(false);
    setStatus(TransactionStatus.IDLE);
    refetch();
    setError(null);
  }, [refetch, setIsConfirmationModalOpen, setStatus, setError]);

  const handleOpenConfirmationModal = useCallback(() => {
    setIsConfirmationModalOpen(true);
    setStatus(TransactionStatus.IDLE);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!data || !address) {
      handleCloseConfirmationModal();
      return;
    }

    try {
      setStatus(TransactionStatus.PENDING);

      const hash = await collectFees({
        chain,
        tokenId,
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
    } catch {
      setStatus(TransactionStatus.FAILED);
    }
  }, [
    handleCloseConfirmationModal,
    collectFees,
    data,
    address,
    tokenId,
    chain,
    isCollectAsWrappedNative,
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
          <hr className="border-t border-stroke-default my-5" />
          <TokenPairCard
            title={
              <div className="flex items-center justify-between h-5">
                <span className="">Unclaimed Fees</span>
                {data?.hasUnclaimedFees && (
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
                )}
              </div>
            }
            token0={data?.token0}
            token1={data?.token1}
            value0={formatNumber(+(data?.unclaimedFees0 ?? 0), {
              maximumFractionDigits: data?.token0?.coinDecimals,
            })}
            value1={formatNumber(+(data?.unclaimedFees1 ?? 0), {
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
          onOpenChange={(value) => setIsConfirmationModalOpen(value)}
        >
          <TransactionSummary
            position={data.position}
            token0={data.token0}
            token1={data.token1}
            unclaimedFees0={data.unclaimedFees0}
            unclaimedFees1={data.unclaimedFees1}
            type={TransactionType.COLLECT_FEES}
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
