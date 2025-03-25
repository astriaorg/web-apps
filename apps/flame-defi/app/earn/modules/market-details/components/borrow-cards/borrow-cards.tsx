import {
  Card,
  CardContent,
  CardFigureInput,
  CardLabel,
  Skeleton,
  useAssetAmountInput,
} from "@repo/ui/components";
import { useFormatAbbreviatedNumber } from "@repo/ui/hooks";
import Big from "big.js";
import { Image } from "components/image";
import { WalletActionButton } from "earn/components/wallet-action-button";
import { ROUTES } from "earn/constants/routes";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";
import { redirect } from "next/navigation";
import { useEffect, useMemo } from "react";
import { FormattedNumber } from "react-intl";
import { useAccount } from "wagmi";

export const BorrowCards = () => {
  const {
    query: { data, isPending },
  } = usePageContext();
  const { formatAbbreviatedNumber } = useFormatAbbreviatedNumber();
  const { isConnected } = useAccount();

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
    balance: "0",
    minimum: "0",
    asset: data?.marketByUniqueKey.collateralAsset ?? undefined,
  });

  const {
    amount: amountBorrow,
    onInput: onInputBorrow,
    onReset: onResetBorrow,
    isValid: isValidBorrow,
  } = useAssetAmountInput({
    balance: "0",
    minimum: "0",
    asset: data?.marketByUniqueKey.collateralAsset ?? undefined,
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
        value: (
          <FormattedNumber
            value={0}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
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
        value: (
          <FormattedNumber
            value={0}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        ),
      },
      {
        label: {
          left: "LTV / Liquidation LTV",
        },
        value: (
          <>
            <FormattedNumber
              value={0}
              minimumFractionDigits={2}
              style="percent"
            />
            {` / `}
            <FormattedNumber
              value={0}
              minimumFractionDigits={2}
              style="percent"
            />
          </>
        ),
      },
    ];
  }, [data]);

  useEffect(() => {
    if (!isConnected) {
      onResetSupply();
      onResetBorrow();
    }
  }, [isConnected, onResetSupply, onResetBorrow]);

  return (
    <div className="flex flex-col gap-2">
      <Card isLoading={isPending}>
        <CardContent className="space-y-2">
          <CardLabel>
            <span className="flex-1 truncate">
              {`Supply Collateral ${data?.marketByUniqueKey.collateralAsset?.symbol}`}
            </span>
            <div>
              <Image
                src={data?.marketByUniqueKey.collateralAsset?.logoURI}
                alt={data?.marketByUniqueKey.collateralAsset?.name}
                width={16}
                height={16}
                className="rounded-full"
              />
            </div>
          </CardLabel>
          <CardFigureInput
            value={amountSupply.value}
            onInput={onInputSupply}
            readOnly={!isConnected}
          />
          <CardLabel className="text-typography-light text-sm/3">
            {data?.marketByUniqueKey.collateralAsset?.priceUsd &&
            amountSupply.value
              ? formatAbbreviatedNumber(
                  new Big(data.marketByUniqueKey.collateralAsset.priceUsd ?? 0)
                    .mul(amountSupply.value)
                    .toFixed(),
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    style: "currency",
                    currency: "USD",
                  },
                  { threshold: "million" },
                )
              : "-"}
          </CardLabel>
        </CardContent>
      </Card>
      <Card isLoading={isPending}>
        <CardContent className="space-y-2">
          <CardLabel>
            <span className="flex-1 truncate">
              {`Borrow ${data?.marketByUniqueKey.loanAsset.symbol}`}
            </span>
            <div>
              <Image
                src={data?.marketByUniqueKey.loanAsset.logoURI}
                alt={data?.marketByUniqueKey.loanAsset.name}
                width={16}
                height={16}
                className="rounded-full"
              />
            </div>
          </CardLabel>
          <CardFigureInput
            value={amountBorrow.value}
            onInput={onInputBorrow}
            readOnly={!isConnected}
          />
          <CardLabel className="text-typography-light text-sm/3">
            {data?.marketByUniqueKey.loanAsset.priceUsd && amountBorrow.value
              ? formatAbbreviatedNumber(
                  new Big(data.marketByUniqueKey.loanAsset.priceUsd ?? 0)
                    .mul(amountBorrow.value)
                    .toFixed(),
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                    style: "currency",
                    currency: "USD",
                  },
                  { threshold: "million" },
                )
              : "-"}
          </CardLabel>
        </CardContent>
      </Card>
      <Card isLoading={isPending}>
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
