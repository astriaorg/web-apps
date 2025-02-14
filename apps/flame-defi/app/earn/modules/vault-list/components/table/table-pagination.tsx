import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  renderPaginationItems,
  Skeleton,
} from "@repo/ui/shadcn-primitives";
import { PAGE_SIZE } from "earn/modules/vault-list/hooks/useFetchVaults";
import { usePageContext } from "earn/modules/vault-list/hooks/usePageContext";
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
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setCurrentPage(currentPage - 1)}
              isDisabled={currentPage === 1}
            />
          </PaginationItem>
          {renderPaginationItems({
            totalPages,
            currentPage,
            setCurrentPage,
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => setCurrentPage(currentPage + 1)}
              isDisabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Skeleton>
  );
};
