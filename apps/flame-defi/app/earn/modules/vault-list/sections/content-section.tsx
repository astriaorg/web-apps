import { SearchInput } from "earn/components/search-input";
import { getPlaceholderData, VaultListTable } from "earn/components/vault";
import { OrderDirection, Vault } from "earn/generated/gql/graphql";
import { PAGE_SIZE } from "earn/modules/vault-list/hooks/use-fetch-vaults";
import { usePageContext } from "earn/modules/vault-list/hooks/use-page-context";
import { useMemo } from "react";

import { Pagination, Skeleton, StatusCard } from "@repo/ui/components";

export const ContentSection = () => {
  const {
    currentPage,
    setCurrentPage,
    ordering,
    sorting,
    setSorting,
    search,
    setSearch,
    query: { data, isPending, isRefetching },
    status,
  } = usePageContext();

  const totalPages = useMemo(() => {
    return Math.ceil((data?.vaults?.pageInfo?.countTotal ?? 0) / PAGE_SIZE);
  }, [data?.vaults?.pageInfo?.countTotal]);

  const formattedData = useMemo(() => {
    if (isPending) {
      return getPlaceholderData(PAGE_SIZE);
    }

    return (data?.vaults.items ?? []) as Vault[];
  }, [data, isPending]);

  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="flex w-full mb-4">
        <Skeleton
          isLoading={isRefetching && !data?.vaults.items?.length}
          className="w-full md:w-52"
        >
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Skeleton>
      </div>

      {status === "error" && (
        <StatusCard status="error">
          {`We couldn't fetch vault data. Please try again later.`}
        </StatusCard>
      )}
      {status === "empty" && (
        <StatusCard status="empty">{`No vaults found.`}</StatusCard>
      )}
      {status === "success" && (
        <>
          <VaultListTable
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
            <Skeleton isLoading={isPending} className="w-52">
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </Skeleton>
          </div>
        </>
      )}
    </section>
  );
};
