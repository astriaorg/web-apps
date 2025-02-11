import { useDebounce } from "@repo/ui/hooks";
import {
  createColumnHelper,
  getCoreRowModel,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import Big from "big.js";
import { OrderDirection, Vault, VaultOrderBy } from "earn/gql/graphql";
import {
  PAGE_SIZE,
  PLACEHOLDER_DATA,
  useFetchVaults,
} from "earn/hooks/useFetchVaults";
import Image from "next/image";
import { createContext, PropsWithChildren, useMemo, useState } from "react";
import { FormattedNumber } from "react-intl";

type Status = "error" | "empty" | "success";

export interface TableContextProps extends PropsWithChildren {
  table: Table<Vault>;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  search: string;
  setSearch: (value: string) => void;
  orderBy: VaultOrderBy;
  orderDirection: OrderDirection;
  status: Status;
  query: ReturnType<typeof useFetchVaults>;
}

export const TableContext = createContext<TableContextProps | undefined>(
  undefined,
);

export const TableContextProvider = ({ children }: PropsWithChildren) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { orderBy, orderDirection } = useMemo(() => {
    return {
      orderBy:
        (sorting.map((it) => it.id).join(",") as VaultOrderBy) ||
        VaultOrderBy.TotalAssets,
      orderDirection:
        (sorting
          .map((it) => (it.desc ? OrderDirection.Desc : OrderDirection.Asc))
          .join(",") as OrderDirection) || OrderDirection.Desc,
    };
  }, [sorting]);

  const query = useFetchVaults({
    variables: {
      first: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
      orderBy,
      orderDirection,
      where: { search: debouncedSearch || null, totalAssets_gte: 1 },
    },
  });

  const columnHelper = createColumnHelper<Vault>();

  const columns = useMemo(() => {
    // Use `VaultOrderBy` as ID for sorting.
    return [
      columnHelper.accessor("name", {
        id: "name",
        header: "Vault Name",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2">
              {row.original.asset.logoURI && (
                <Image
                  src={row.original.asset.logoURI}
                  alt={row.original.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>{row.original.name}</span>
            </div>
          );
        },
        enableSorting: false,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("state.totalAssets", {
        id: "TotalAssets",
        header: "Total Assets",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-4">
              <span>
                <FormattedNumber
                  value={
                    +new Big(row.original.state?.totalAssets ?? 0)
                      .div(10 ** row.original.asset.decimals)
                      .toFixed(2)
                  }
                />
                &nbsp;
                {row.original.symbol}
              </span>
              <span className="text-xs text-secondary bg-muted-foreground px-2 py-0.5 rounded-sm opacity-75">
                <FormattedNumber
                  value={
                    +new Big(row.original.state?.totalAssetsUsd ?? 0).toFixed(2)
                  }
                  style="currency"
                  currency="USD"
                />
              </span>
            </div>
          );
        },
        enableSorting: true,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("state.apy", {
        id: "Apy",
        header: "APY",
        cell: (info) => {
          return (
            <div>
              <FormattedNumber
                value={info.getValue()}
                style="percent"
                minimumFractionDigits={2}
              />
            </div>
          );
        },
        enableSorting: true,
        footer: (info) => info.column.id,
      }),
    ];
  }, [columnHelper]);

  const formattedData = useMemo(() => {
    if (query.isPending) {
      return PLACEHOLDER_DATA.vaults.items as Vault[];
    }

    return query.data?.vaults.items ? (query.data.vaults.items as Vault[]) : [];
  }, [query.data, query.isPending]);

  const table = useReactTable<Vault>({
    columns,
    data: formattedData,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    enableSortingRemoval: false,
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
    <TableContext.Provider
      value={{
        table,
        currentPage,
        setCurrentPage,
        search,
        setSearch,
        orderBy,
        orderDirection,
        status,
        query,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};
