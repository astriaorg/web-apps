import {
  Card,
  CardContent,
  CardLabel,
  Skeleton,
  useAssetAmountInput,
} from "@repo/ui/components";
import { Image } from "components/image";
import { DepositCard } from "earn/components/deposit-card";
import { WalletActionButton } from "earn/components/wallet-action-button";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
import React, { useEffect, useMemo } from "react";
import { FormattedNumber } from "react-intl";
import { useAccount } from "wagmi";

// TODO: Get balance from contract.
const BALANCE = "0";

export const DepositCards = () => {
  const {
    query: { data, isPending },
  } = usePageContext();
  const { isConnected } = useAccount();

  const { amount, onInput, onReset, isValid } = useAssetAmountInput({
    balance: "0",
    minimum: "0",
    asset: data?.vaultByAddress.asset,
  });

  const items = useMemo<
    {
      label: {
        left: React.ReactNode;
        right: React.ReactNode;
      };
      value: React.ReactNode;
    }[]
  >(() => {
    return [
      {
        label: {
          left: "My Position",
          right: (
            <div className="flex items-center space-x-1">
              <Image
                src={data?.vaultByAddress?.asset.logoURI}
                alt={data?.vaultByAddress.asset.name}
                width={16}
                height={16}
                className="rounded-full"
              />
              <span>{data?.vaultByAddress.asset.symbol}</span>
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
          left: "APY",
          right: null,
        },
        value: (
          <FormattedNumber
            value={data?.vaultByAddress.state?.netApy ?? 0}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
            style="percent"
          />
        ),
      },
      {
        label: {
          left: "Projected Earnings / Month",
          right: "USD",
        },
        value: (
          <FormattedNumber
            value={0}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
            style="currency"
            currency="USD"
          />
        ),
      },
      {
        label: {
          left: "Projected Earnings / Year",
          right: "USD",
        },
        value: (
          <FormattedNumber
            value={0}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
            style="currency"
            currency="USD"
          />
        ),
      },
      {
        label: {
          left: "Wallet Balance",
          right: data?.vaultByAddress.asset.symbol,
        },
        value: (
          <FormattedNumber
            value={0}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
          />
        ),
      },
    ];
  }, [data]);

  useEffect(() => {
    if (!isConnected) {
      onReset();
    }
  }, [isConnected, onReset]);

  return (
    <div className="flex flex-col gap-2">
      <DepositCard
        asset={data?.vaultByAddress.asset}
        title="Deposit"
        amount={amount}
        balance={BALANCE}
        isLoading={isPending}
        onInput={onInput}
      />
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
        <WalletActionButton disabled={isConnected ? !isValid : false}>
          Deposit
        </WalletActionButton>
      </Skeleton>
    </div>
  );
};
