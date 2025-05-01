import {
  Card,
  CardContent,
  CardLabel,
  Skeleton,
  useTokenAmountInput,
} from "@repo/ui/components";
import Big from "big.js";
import { Image } from "components/image";
import { DepositCard } from "earn/components/deposit-card";
import { WalletActionButton } from "earn/components/wallet-action-button";
import { useFetchVaultPosition } from "earn/modules/vault-details/hooks/use-fetch-vault-position";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo } from "react";
import { FormattedNumber } from "react-intl";
import { useAccount } from "wagmi";

// TODO: Get balance from contract.
const BALANCE = "0";

export const DepositCards = () => {
  const params = useParams<{ address: string }>();
  const {
    query: { data, isPending },
  } = usePageContext();
  const { isConnected, address } = useAccount();

  const {
    data: vaultPositionData,
    isPending: vaultPositionIsPending,
    fetchStatus,
  } = useFetchVaultPosition({
    variables: {
      vault: params.address,
      address,
    },
  });

  const { amount, onInput, onReset, isValid } = useTokenAmountInput({
    balance: "0",
    minimum: "0",
    token: data?.vaultByAddress.asset,
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
            value={new Big(vaultPositionData?.vaultPosition.state?.assets ?? 0)
              .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
              .toNumber()}
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
            value={new Big(vaultPositionData?.vaultPosition.state?.assets ?? 0)
              .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
              .mul(
                // APY is the annual rate with compounding, this calculates the monthly rate.
                Math.pow(
                  1 + (data?.vaultByAddress.state?.netApy ?? 0),
                  1 / 12,
                ) - 1,
              )
              .mul(data?.vaultByAddress.asset.priceUsd ?? 0)
              .toNumber()}
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
            value={new Big(vaultPositionData?.vaultPosition.state?.assets ?? 0)
              .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
              .mul(data?.vaultByAddress.state?.netApy ?? 0)
              .mul(data?.vaultByAddress.asset.priceUsd ?? 0)
              .toNumber()}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
            style="currency"
            currency="USD"
          />
        ),
      },
    ];
  }, [data, vaultPositionData]);

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
      <Card
        isLoading={
          isPending || (vaultPositionIsPending && fetchStatus !== "idle")
        }
      >
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
                {isConnected && fetchStatus !== "idle" ? it.value : "-"}
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
