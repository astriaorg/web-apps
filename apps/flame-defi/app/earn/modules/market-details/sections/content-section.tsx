import { StatusCard } from "@repo/ui/components";
import { SortingState } from "@tanstack/react-table";
import Big from "big.js";
import { SummaryCards, SummaryCardsProps } from "earn/components/summary-cards";
import { getPlaceholderData, VaultListTable } from "earn/components/vault";
import { Vault, VaultOrderBy } from "earn/generated/gql/graphql";
import { BorrowCards } from "earn/modules/market-details/components/borrow-cards";
import { OverviewCards } from "earn/modules/market-details/components/overview-cards";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";
import { useMemo, useState } from "react";

export const ContentSection = () => {
  const {
    query: { data, isPending, status },
  } = usePageContext();

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: VaultOrderBy.TotalAssetsUsd,
      desc: true,
    },
  ]);

  const formattedData = useMemo(() => {
    if (isPending) {
      return getPlaceholderData(3);
    }

    return data?.marketByUniqueKey.supplyingVaults
      ? (data.marketByUniqueKey.supplyingVaults as Vault[])
      : [];
  }, [data, isPending]);

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
        value: new Big(data?.marketByUniqueKey.state?.supplyAssets ?? 0)
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
          .div(10 ** 18)
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
              <VaultListTable
                data={formattedData}
                sorting={sorting}
                onSortingChange={setSorting}
                getHeaderIsActive={(header) => header.id === sorting[0]?.id}
                getHeaderIsAscending={(header) =>
                  header.column.getNextSortingOrder() === "desc"
                }
                isLoading={isPending}
              />
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
