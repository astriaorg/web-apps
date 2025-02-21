import { Pagination, Skeleton } from "@repo/ui/shadcn-primitives";
import { PAGE_SIZE } from "earn/modules/vault-list/hooks/use-fetch-vaults";
import { usePageContext } from "earn/modules/vault-list/hooks/use-page-context";
import { useMemo } from "react";

export const TablePagination = () => {
  const {
    currentPage,
    setCurrentPage,
    query: { data, isPending },
  } = usePageContext();

  const totalPages = useMemo(() => {
    return Math.ceil((data?.vaults?.pageInfo?.countTotal ?? 0) / PAGE_SIZE);
  }, [data?.vaults?.pageInfo?.countTotal]);

  return (
    <Skeleton isLoading={isPending} className="w-52">
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Skeleton>
  );
};
