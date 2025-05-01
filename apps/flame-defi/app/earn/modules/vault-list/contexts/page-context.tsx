import { OnChangeFn, SortingState } from "@tanstack/react-table";
import { OrderDirection, VaultOrderBy } from "earn/generated/gql/graphql";
import {
  PAGE_SIZE,
  useFetchVaults,
} from "earn/modules/vault-list/hooks/use-fetch-vaults";
import { createContext, PropsWithChildren, useMemo, useState } from "react";

import { useDebounce } from "@repo/ui/hooks";

type Status = "error" | "empty" | "success";

export interface PageContextProps extends PropsWithChildren {
  currentPage: number;
  setCurrentPage: (value: number) => void;
  search: string;
  setSearch: (value: string) => void;
  ordering: {
    orderBy: VaultOrderBy;
    orderDirection: OrderDirection;
  };
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  status: Status;
  query: ReturnType<typeof useFetchVaults>;
}

export const PageContext = createContext<PageContextProps | undefined>(
  undefined,
);

export const PageContextProvider = ({ children }: PropsWithChildren) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: VaultOrderBy.TotalAssetsUsd,
      desc: true,
    },
  ]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { orderBy, orderDirection } = useMemo(() => {
    return {
      orderBy: sorting.map((it) => it.id).join(",") as VaultOrderBy,
      orderDirection: sorting
        .map((it) => (it.desc ? OrderDirection.Desc : OrderDirection.Asc))
        .join(",") as OrderDirection,
    };
  }, [sorting]);

  const query = useFetchVaults({
    variables: {
      first: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
      orderBy,
      orderDirection,
      // TODO: Get chain ID from wallet context.
      where: {
        search: debouncedSearch || null,
        totalAssets_gte: 1,
        chainId_in: [1],
      },
    },
  });

  const status = useMemo<Status>(() => {
    if (query.isError) {
      return "error";
    }

    if (!query.isPending && !query.data?.vaults?.items?.length) {
      return "empty";
    }

    return "success";
  }, [query.isError, query.isPending, query.data?.vaults?.items?.length]);

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
