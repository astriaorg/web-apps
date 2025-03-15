import { Skeleton, StatusCard } from "@repo/ui/components";
import { formatAbbreviatedNumber } from "@repo/ui/utils";
import { SortingState } from "@tanstack/react-table";
import Big from "big.js";
import { SummaryCards, SummaryCardsProps } from "earn/components/summary-cards";
import { getPlaceholderData, VaultListTable } from "earn/components/vault";
import { Vault, VaultOrderBy } from "earn/generated/gql/graphql";
import { BorrowCards } from "earn/modules/market-details/components/borrow-cards";
import { OverviewCards } from "earn/modules/market-details/components/overview-cards";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

export const ContentSection = () => {
  const { formatNumber } = useIntl();
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
          left: "Total Supply",
          right: data?.marketByUniqueKey.loanAsset.symbol,
        },
        footer: (() => {
          const { value, suffix } = formatAbbreviatedNumber(
            (data?.marketByUniqueKey.state?.supplyAssetsUsd ?? 0).toString(),
          );

          return (
            formatNumber(+value, {
              style: "currency",
              currency: "USD",
            }) + suffix
          );
        })(),
        value: new Big(data?.marketByUniqueKey.state?.supplyAssets ?? 0)
          .div(10 ** (data?.marketByUniqueKey.loanAsset.decimals ?? 18))
          .toNumber(),
        options: {
          minimumFractionDigits: 2,
        },
        useAbbreviatedNumberFormat: true,
        variant: "accent",
      },
      {
        label: {
          left: "Liquidity",
          right: data?.marketByUniqueKey.loanAsset.symbol,
        },
        footer: (() => {
          const { value, suffix } = formatAbbreviatedNumber(
            (data?.marketByUniqueKey.state?.liquidityAssetsUsd ?? 0).toString(),
          );

          return (
            formatNumber(+value, {
              style: "currency",
              currency: "USD",
            }) + suffix
          );
        })(),
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
          left: "APY",
          right: data?.marketByUniqueKey.loanAsset.symbol,
        },
        value: data?.marketByUniqueKey.state?.netBorrowApy ?? 0,
        options: {
          style: "percent",
          minimumFractionDigits: 2,
        },
      },
    ];
  }, [data, formatNumber]);

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
            <SummaryCards
              items={items}
              isLoading={isPending}
              className="grid gap-2 md:grid-cols-3"
            />

            <div className="mt-10 flex flex-col space-y-4">
              <Skeleton isLoading={isPending} className="w-52">
                <div className="text-base/4 font-semibold">Overview</div>
              </Skeleton>
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
