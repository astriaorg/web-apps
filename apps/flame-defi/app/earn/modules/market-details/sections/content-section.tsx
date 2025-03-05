import { StatusCard } from "@repo/ui/components";
import Big from "big.js";
import { SummaryCards, SummaryCardsProps } from "earn/components/summary-cards";
import { BorrowCards } from "earn/modules/market-details/components/borrow-cards";
import { OverviewCards } from "earn/modules/market-details/components/overview-cards";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";
import { useMemo } from "react";

export const ContentSection = () => {
  const {
    query: { data, isPending, status },
  } = usePageContext();

  const items = useMemo<SummaryCardsProps["items"]>(() => {
    return [
      {
        label: {
          left: "APY",
          right: data?.marketByUniqueKey.loanAsset.symbol,
        },
        value: data?.marketByUniqueKey.state?.netBorrowApy ?? 0,
        options: {
          style: "percent",
          minimumFractionDigits: 2,
        },
        variant: "accent",
      },
      {
        label: {
          left: "Total Supply",
          right: data?.marketByUniqueKey.loanAsset.symbol,
        },
        value: new Big(data?.marketByUniqueKey.state?.collateralAssets ?? 0)
          .div(10 ** (data?.marketByUniqueKey.loanAsset.decimals ?? 18))
          .toNumber(),
        options: {
          minimumFractionDigits: 2,
        },
        useAbbreviatedNumberFormat: true,
      },
      {
        label: {
          left: "Liquidity",
          right: data?.marketByUniqueKey.loanAsset.symbol,
        },
        value: new Big(data?.marketByUniqueKey.state?.liquidityAssets ?? 0)
          .div(10 ** (data?.marketByUniqueKey.loanAsset.decimals ?? 18))
          .toNumber(),
        options: {
          minimumFractionDigits: 2,
        },
        useAbbreviatedNumberFormat: true,
      },
      {
        label: {
          left: "LLTV",
        },
        value: new Big(data?.marketByUniqueKey.lltv ?? 0)
          .div(10 ** (data?.marketByUniqueKey.collateralAsset?.decimals ?? 18))
          .toNumber(),
        options: {
          style: "percent",
          minimumFractionDigits: 2,
        },
      },
    ];
  }, [data]);

  return (
    <section className="flex flex-col px-4">
      {status === "error" && (
        <StatusCard>
          {`We couldn't fetch this market. Please try again later.`}
        </StatusCard>
      )}
      {status !== "error" && (
        <div className="mt-12 flex flex-col gap-10 lg:gap-2 lg:flex-row">
          {/* Summary section. */}
          <div className="order-2 lg:order-1 lg:basis-2/3">
            <div className="flex flex-col gap-2">
              <SummaryCards
                items={items}
                isLoading={isPending}
                className="grid grid-cols-2 gap-2"
              />
              <OverviewCards />
            </div>
          </div>

          {/* Borrow section. */}
          <div className="order-1 lg:order-2 lg:basis-1/3 overflow-hidden">
            <BorrowCards />
          </div>
        </div>
      )}
    </section>
  );
};
