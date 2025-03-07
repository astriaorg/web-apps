import { Button, Card, CardFigureInput, CardLabel } from "@repo/ui/components";
import { FormattedNumber } from "@repo/ui/intl";
import { Image } from "components/image";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";
import { useMemo } from "react";

export const BorrowCards = () => {
  const {
    query: { data, isPending },
  } = usePageContext();

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

  return (
    <div className="flex flex-col gap-2">
      <Card isLoading={isPending} padding="md" className="space-y-2">
        <CardLabel>
          <span className="flex-1 truncate">
            Supply Collateral {data?.marketByUniqueKey.collateralAsset?.symbol}
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
        <CardFigureInput placeholder="0.00" />
        <CardLabel className="text-typography-light text-sm/3">
          <FormattedNumber
            value={0}
            minimumFractionDigits={2}
            maximumFractionDigits={2}
            style="currency"
            currency="USD"
          />
        </CardLabel>
      </Card>
      <Card isLoading={isPending} padding="md" className="space-y-2">
        <CardLabel>
          <span className="flex-1 truncate">
            Borrow {data?.marketByUniqueKey.loanAsset.symbol}
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
        <CardFigureInput placeholder="0.00" />
        <CardLabel className="text-typography-light text-sm/3">
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
            <CardLabel className="text-2xl/6 text-typography-default">
              {it.value}
            </CardLabel>
          </div>
        ))}
      </Card>
      <Button>Connect Wallet</Button>
    </div>
  );
};
