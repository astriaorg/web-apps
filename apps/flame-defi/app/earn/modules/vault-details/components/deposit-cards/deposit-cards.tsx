import { Card, CardFigureInput, CardLabel } from "earn/components/card";
import { Image } from "earn/components/image";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
import React, { useMemo } from "react";
import { FormattedNumber } from "react-intl";

export const DepositCards = () => {
  const {
    query: { data, isPending },
  } = usePageContext();

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

  return (
    <div className="flex flex-col gap-2">
      <Card isLoading={isPending} padding="md">
        <CardLabel>
          <span className="flex-1">
            Deposit {data?.vaultByAddress.asset.symbol}
          </span>
          <div>
            <Image
              src={data?.vaultByAddress?.asset.logoURI}
              alt={data?.vaultByAddress.asset.name}
              width={16}
              height={16}
              className="rounded-full"
            />
          </div>
        </CardLabel>
        <CardFigureInput placeholder="0.00" />
        <CardLabel className="text-text-light text-sm/3">
          <FormattedNumber
            value={0}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
            style="currency"
            currency="USD"
          />
        </CardLabel>
      </Card>
      <Card isLoading={isPending} padding="md" className="space-y-4">
        {items.map((it, index) => (
          <div
            key={`deposit-card_card-item_${index}`}
            className="flex flex-col space-y-1"
          >
            <CardLabel>
              <span className="flex-1">{it.label.left}</span>
              <div>{it.label.right}</div>
            </CardLabel>
            <CardLabel className="text-2xl/6 text-text">{it.value}</CardLabel>
          </div>
        ))}
      </Card>
    </div>
  );
};
