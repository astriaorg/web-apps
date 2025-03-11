import { StatusCard } from "@repo/ui/components";
import { getPlaceholderData, MarketListTable } from "earn/components/market";
import { Market, OrderDirection } from "earn/generated/gql/graphql";
import { PAGE_SIZE } from "earn/modules/market-list/hooks/use-fetch-markets";
import { usePageContext } from "earn/modules/market-list/hooks/use-page-context";
// import {
//   TablePagination,
//   TableSearch,
// } from "earn/modules/vault-list/components/table";
import { useMemo } from "react";

export const ContentSection = () => {
  const {
    ordering,
    sorting,
    setSorting,
    query: { data, isPending },
    status,
  } = usePageContext();

  const formattedData = useMemo(() => {
    if (isPending) {
      return getPlaceholderData(PAGE_SIZE);
    }

    return data?.markets.items ? (data.markets.items as Market[]) : [];
  }, [data, isPending]);

  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="flex w-full mb-4">{/* <TableSearch /> */}</div>

      {status === "error" && (
        <StatusCard>
          {`We couldn't fetch vault data. Please try again later.`}
        </StatusCard>
      )}
      {status === "empty" && <StatusCard>{`No vaults found.`}</StatusCard>}
      {status === "success" && (
        <>
          <MarketListTable
            data={formattedData}
            sorting={sorting}
            onSortingChange={setSorting}
            getHeaderIsActive={(header) => header.id === ordering.orderBy}
            getHeaderIsAscending={() =>
              ordering.orderDirection === OrderDirection.Asc
            }
            isLoading={isPending}
          />

          <div className="flex justify-center mt-10">
            {/* <TablePagination /> */}
          </div>
        </>
      )}
    </section>
  );
};
