import { AnimatedCounter, Card, CardLabel } from "@repo/ui/components";
import { FormatNumberOptions } from "@repo/ui/intl";
import Big from "big.js";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
import { useMemo } from "react";

export const SummaryCards = () => {
  const {
    query: { isPending, data },
  } = usePageContext();

  const items = useMemo<
    {
      label: {
        left: React.ReactNode;
        right?: React.ReactNode;
      };
      value: number;
      variant?: React.ComponentPropsWithoutRef<typeof Card>["variant"];
      options?: FormatNumberOptions;
      useAbbreviatedNumberFormat?: boolean;
    }[]
  >(() => {
    return [
      {
        label: { left: "APY" },
        value: data?.vaultByAddress.state?.netApy ?? 0,
        variant: "accent",
        options: {
          style: "percent",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      },
      {
        label: {
          left: "Total Deposits",
          right: data?.vaultByAddress.asset.symbol,
        },
        value: new Big(data?.vaultByAddress.state?.totalAssets ?? 0)
          .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
          .toNumber(),
        options: {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        },
        useAbbreviatedNumberFormat: true,
      },
      {
        label: {
          left: "Liquidity",
          right: data?.vaultByAddress.asset.symbol,
        },
        value: new Big(data?.vaultByAddress.liquidity?.underlying ?? 0)
          .div(10 ** (data?.vaultByAddress.asset.decimals ?? 18))
          .toNumber(),
        options: {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        },
        useAbbreviatedNumberFormat: true,
      },
    ];
  }, [data]);

  return (
    <div className="grid lg:grid-cols-3 gap-2">
      {items.map((it, index) => (
        <Card
          key={`summary-card_card-item_${index}`}
          isLoading={isPending}
          padding="md"
          variant={it.variant}
          className="space-y-2"
        >
          <CardLabel>
            <span className="flex-1">{it.label.left}</span>
            <span>{it.label.right}</span>
          </CardLabel>
          <AnimatedCounter
            value={it.value}
            className="text-5xl/12 font-dot truncate"
            options={it.options}
            useAbbreviatedNumberFormat={it.useAbbreviatedNumberFormat}
          />
        </Card>
      ))}
    </div>
  );
};
