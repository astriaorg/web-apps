import { StatusCard } from "earn/components/status-card";
import {
  Table,
  TablePagination,
  TableSearch,
} from "earn/modules/vault-list/components/table";
import { usePageContext } from "earn/modules/vault-list/hooks/use-page-context";
import { useMemo } from "react";

type Status = "error" | "empty" | "success";

export const TableSection = () => {
  const {
    query: { data, isError, isPending },
  } = usePageContext();

  const status = useMemo<Status>(() => {
    if (isError) {
      return "error";
    }

    if (!isPending && !data?.vaults?.items?.length) {
      return "empty";
    }

    return "success";
  }, [isError, isPending, data?.vaults?.items?.length]);

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
          <Table />

          <div className="flex justify-center mt-10">
            <TablePagination />
          </div>
        </>
      )}
    </section>
  );
};
