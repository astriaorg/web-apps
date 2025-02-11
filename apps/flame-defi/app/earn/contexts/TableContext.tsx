import { useDebounce } from "@repo/ui/hooks";
import { CaretRightIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/lib";
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
            <div className="flex items-center space-x-2 md:space-x-4">
              {row.original.asset.logoURI && (
                <Image
                  src={row.original.asset.logoURI}
                  alt={row.original.name}
                  width={30}
                  height={30}
                  className="rounded-full"
                />
              )}
              <div className="flex flex-col space-y-1 truncate">
                <span className="text-base/4 truncate">
                  {row.original.name}
                </span>
                <span className="md:hidden text-xs/3">
                  <FormattedNumber
                    value={row.original.state?.apy ?? 0}
                    style="percent"
                    minimumFractionDigits={2}
                  />
                  &nbsp;APY
                </span>
              </div>
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
            <div
              className={cn(
                "flex flex-col items-start space-x-0 space-y-1",
                "md:flex-row md:items-center md:space-x-3 md:space-y-0",
              )}
            >
              <span className={cn("text-xs/3", "md:text-base/4")}>
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
              <span className="text-xs text-secondary font-medium bg-muted-foreground px-1 py-0.5 rounded-sm opacity-75">
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
        header: () => {
          return (
            <div className="hidden md:block">
              <span>APY</span>
            </div>
          );
        },
        cell: (info) => {
          return (
            <>
              <div className="hidden md:block">
                <FormattedNumber
                  value={info.getValue()}
                  style="percent"
                  minimumFractionDigits={2}
                />
              </div>
              <div className="block md:hidden">
                <CaretRightIcon className="text-grey-light" size={16} />
              </div>
            </>
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
