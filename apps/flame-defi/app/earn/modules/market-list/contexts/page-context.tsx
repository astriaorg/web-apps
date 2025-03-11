import { useDebounce } from "@repo/ui/hooks";
import { OnChangeFn, SortingState } from "@tanstack/react-table";
import { MarketOrderBy, OrderDirection } from "earn/generated/gql/graphql";
import {
  PAGE_SIZE,
  useFetchMarkets,
} from "earn/modules/market-list/hooks/use-fetch-markets";
import { createContext, PropsWithChildren, useMemo, useState } from "react";

type Status = "error" | "empty" | "success";

export interface PageContextProps extends PropsWithChildren {
  currentPage: number;
  setCurrentPage: (value: number) => void;
  search: string;
  setSearch: (value: string) => void;
  ordering: {
    orderBy: MarketOrderBy;
    orderDirection: OrderDirection;
  };
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  status: Status;
  query: ReturnType<typeof useFetchMarkets>;
}

export const PageContext = createContext<PageContextProps | undefined>(
  undefined,
);

export const PageContextProvider = ({ children }: PropsWithChildren) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { orderBy, orderDirection } = useMemo(() => {
    return {
      orderBy:
        (sorting.map((it) => it.id).join(",") as MarketOrderBy) ||
        MarketOrderBy.TotalLiquidityUsd,
      orderDirection:
        (sorting
          .map((it) => (it.desc ? OrderDirection.Desc : OrderDirection.Asc))
          .join(",") as OrderDirection) || OrderDirection.Desc,
    };
  }, [sorting]);

  const query = useFetchMarkets({
    variables: {
      first: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
      orderBy,
      orderDirection,
      where: { search: debouncedSearch || null },
    },
  });

  const status = useMemo<Status>(() => {
    if (query.isError) {
      return "error";
    }

    if (!query.isPending && !query.data?.markets?.items?.length) {
      return "empty";
    }

    return "success";
  }, [query.isError, query.isPending, query.data?.markets?.items?.length]);

  return (
    <PageContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        search,
        setSearch,
        ordering: {
          orderBy,
          orderDirection,
        },
        sorting,
        setSorting,
        status,
        query,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
