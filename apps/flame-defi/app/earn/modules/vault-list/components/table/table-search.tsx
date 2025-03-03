import { SearchInput, Skeleton } from "@repo/ui/components";
import { usePageContext } from "earn/modules/vault-list/hooks/use-page-context";

export const TableSearch = () => {
  const {
    search,
    setSearch,
    query: { data, isRefetching },
  } = usePageContext();

  return (
    <Skeleton
      isLoading={isRefetching && !data?.vaults.items?.length}
      className="w-full md:w-52"
    >
      <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
    </Skeleton>
  );
};
