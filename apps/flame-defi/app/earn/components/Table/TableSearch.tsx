import { SearchIcon } from "@repo/ui/icons";
import { Input, Skeleton } from "@repo/ui/shadcn-primitives";
import { useTable } from "earn/hooks/useTable";

export const TableSearch = () => {
  const {
    search,
    setSearch,
    query: { data, isRefetching },
  } = useTable();

  return (
    <Skeleton
      isLoading={isRefetching && !data?.vaults.items?.length}
      className="w-[200px]"
    >
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        placeholder="Search vaults"
        startAdornment={<SearchIcon size={16} />}
        className="w-[200px]"
      />
    </Skeleton>
  );
};
