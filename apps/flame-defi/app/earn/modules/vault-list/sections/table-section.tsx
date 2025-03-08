import { StatusCard } from "@repo/ui/components";
import { VaultListTable } from "earn/components/vault";
import { Vault } from "earn/generated/gql/graphql";
import {
  TablePagination,
  TableSearch,
} from "earn/modules/vault-list/components/table";
import { PLACEHOLDER_DATA } from "earn/modules/vault-list/hooks/use-fetch-vaults";
import { usePageContext } from "earn/modules/vault-list/hooks/use-page-context";
import { useMemo } from "react";

export const TableSection = () => {
  const {
    ordering,
    sorting,
    setSorting,
    query: { data, isPending },
    status,
  } = usePageContext();

  const formattedData = useMemo(() => {
    if (isPending) {
      return PLACEHOLDER_DATA.vaults.items as Vault[];
    }

    return data?.vaults.items ? (data.vaults.items as Vault[]) : [];
  }, [data, isPending]);

  return (
    <section className="flex flex-col px-4 md:px-20">
      <div className="flex w-full mb-4">
        <TableSearch />
      </div>

      {status === "error" && (
        <StatusCard>
          {`We couldn't fetch vault data. Please try again later.`}
        </StatusCard>
      )}
      {status === "empty" && <StatusCard>{`No vaults found.`}</StatusCard>}
      {status === "success" && (
        <>
          <VaultListTable
            data={formattedData}
            ordering={ordering}
            sorting={sorting}
            onSortingChange={setSorting}
            isLoading={isPending}
          />

          <div className="flex justify-center mt-10">
            <TablePagination />
          </div>
        </>
      )}
    </section>
  );
};
