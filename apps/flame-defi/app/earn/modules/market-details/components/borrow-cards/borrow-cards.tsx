import {
  Card,
  CardContent,
  CardLabel,
  Skeleton,
  useAssetAmountInput,
} from "@repo/ui/components";
import Big from "big.js";
import { Image } from "components/image";
import { DepositCard } from "earn/components/deposit-card";
import { WalletActionButton } from "earn/components/wallet-action-button";
import { ROUTES } from "earn/constants/routes";
import { useFetchMarketPosition } from "earn/modules/market-details/hooks/use-fetch-market-position";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";
import { redirect, useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { FormattedNumber } from "react-intl";
import { useAccount } from "wagmi";

// TODO: Get balance from contract.
const BALANCE = "0";

export const BorrowCards = () => {
  const params = useParams<{ key: string }>();
  const {
    query: { data, isPending },
  } = usePageContext();
  const { isConnected, address } = useAccount();

  const {
    data: marketPositionData,
    isPending: marketPositionIsPending,
    fetchStatus,
  } = useFetchMarketPosition({
    variables: {
      key: params.key,
      address,
    },
  });

  useEffect(() => {
    // TODO: Should probably use a middleware redirect.
    if (!isPending && !data?.marketByUniqueKey.collateralAsset) {
      redirect(ROUTES.MARKET_LIST);
    }
  }, [isPending, data?.marketByUniqueKey.collateralAsset]);

  const {
    amount: amountSupply,
    onInput: onInputSupply,
    onReset: onResetSupply,
    isValid: isValidSupply,
  } = useAssetAmountInput({
    balance: BALANCE,
    minimum: "0",
    asset: data?.marketByUniqueKey.collateralAsset ?? undefined,
  });

  const {
    amount: amountBorrow,
    onInput: onInputBorrow,
    onReset: onResetBorrow,
    isValid: isValidBorrow,
  } = useAssetAmountInput({
    balance: BALANCE,
    minimum: "0",
    asset: data?.marketByUniqueKey.loanAsset ?? undefined,
  });

  const items = useMemo<
    {
      label: {
        left: React.ReactNode;
        right?: React.ReactNode;
      };
      value: React.ReactNode;
    }[]
  >(() => {
    const isFetchEnabled = isConnected && fetchStatus !== "idle";

    return [
      {
        label: {
          left: "My Collateral Position",
          right: (
            <div className="flex items-center space-x-1">
              <Image
                src={data?.marketByUniqueKey.collateralAsset?.logoURI}
                alt={data?.marketByUniqueKey.collateralAsset?.name}
                width={16}
                height={16}
                className="rounded-full"
              />
              <span>{data?.marketByUniqueKey.collateralAsset?.symbol}</span>
            </div>
          ),
        },
        value: isFetchEnabled ? (
          <FormattedNumber
            value={new Big(
              marketPositionData?.marketPosition.state?.collateral ?? 0,
            )
              .div(
                10 ** (data?.marketByUniqueKey.collateralAsset?.decimals ?? 18),
              )
              .toNumber()}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        ) : (
          "-"
        ),
      },
      {
        label: {
          left: "My Loan Position",
          right: (
            <div className="flex items-center space-x-1">
              <Image
                src={data?.marketByUniqueKey.loanAsset.logoURI}
                alt={data?.marketByUniqueKey.loanAsset.name}
                width={16}
                height={16}
                className="rounded-full"
              />
              <span>{data?.marketByUniqueKey.loanAsset.symbol}</span>
            </div>
          ),
        },
        value: isFetchEnabled ? (
          <FormattedNumber
            value={new Big(
              marketPositionData?.marketPosition.state?.borrowAssets ?? 0,
            )
              .div(10 ** (data?.marketByUniqueKey.loanAsset.decimals ?? 18))
              .toNumber()}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        ) : (
          "-"
        ),
      },
      {
        label: {
          left: "LTV / Liquidation LTV",
        },
        value: (
          <>
            {isFetchEnabled &&
            !!marketPositionData?.marketPosition.state?.collateral ? (
              <FormattedNumber
                value={new Big(
                  marketPositionData?.marketPosition.state?.borrowAssets ?? 0,
                )
                  .div(marketPositionData.marketPosition.state.collateral)
                  .toNumber()}
                minimumFractionDigits={2}
                style="percent"
              />
            ) : (
              "-"
            )}
            {` / `}
            <FormattedNumber
              value={new Big(data?.marketByUniqueKey.lltv ?? 0)
                .div(10 ** 18)
                .toNumber()}
              minimumFractionDigits={2}
              style="percent"
            />
          </>
        ),
      },
    ];
  }, [data, marketPositionData, isConnected, fetchStatus]);

  useEffect(() => {
    if (!isConnected) {
      onResetSupply();
      onResetBorrow();
    }
  }, [isConnected, onResetSupply, onResetBorrow]);

  return (
    <div className="flex flex-col gap-2">
      <DepositCard
        asset={data?.marketByUniqueKey.collateralAsset}
        title="Supply Collateral"
        amount={amountSupply}
        balance={BALANCE}
        isLoading={isPending}
        onInput={onInputSupply}
      />
      <DepositCard
        asset={data?.marketByUniqueKey.loanAsset}
        title="Borrow"
        amount={amountBorrow}
        balance={BALANCE}
        isLoading={isPending}
        onInput={onInputBorrow}
      />
      <Card isLoading={isPending || marketPositionIsPending}>
        <CardContent className="space-y-4">
          {items.map((it, index) => (
            <div
              key={`deposit-card_card-item_${index}`}
              className="flex flex-col space-y-1"
            >
              <CardLabel>
                <span className="flex-1">{it.label.left}</span>
                <div>{it.label.right}</div>
              </CardLabel>
              <CardLabel className="text-2xl/6 text-typography-default">
                {it.value}
              </CardLabel>
            </div>
          ))}
        </CardContent>
      </Card>
      <Skeleton isLoading={isPending}>
        <WalletActionButton
          disabled={isConnected ? !isValidBorrow || !isValidSupply : false}
        >
          Deposit
        </WalletActionButton>
      </Skeleton>
    </div>
  );
};
