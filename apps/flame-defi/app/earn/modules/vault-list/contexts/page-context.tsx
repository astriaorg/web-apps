import { Badge } from "@repo/ui/components";
import { useDebounce } from "@repo/ui/hooks";
import { CaretRightIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import {
  createColumnHelper,
  getCoreRowModel,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import Big from "big.js";
import { NON_BREAKING_SPACE } from "earn/constants/utils";
import { OrderDirection, Vault, VaultOrderBy } from "earn/gql/graphql";
import {
  PAGE_SIZE,
  PLACEHOLDER_DATA,
  useFetchVaults,
} from "earn/modules/vault-list/hooks/use-fetch-vaults";
import Image from "next/image";
import { createContext, PropsWithChildren, useMemo, useState } from "react";
import { FormattedNumber } from "react-intl";

export interface PageContextProps extends PropsWithChildren {
  table: Table<Vault>;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  search: string;
  setSearch: (value: string) => void;
  orderBy: VaultOrderBy;
  orderDirection: OrderDirection;
  query: ReturnType<typeof useFetchVaults>;
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
              {row.original.asset.logoURI ? (
                <Image
                  src={row.original.asset.logoURI}
                  alt={row.original.name}
                  width={30}
                  height={30}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div className="rounded-full shrink-0 w-[30px] h-[30px] bg-icon-light" />
              )}
              <div className="flex flex-col space-y-1 overflow-hidden">
                <span className="text-base/4 truncate max-w-[25vw] md:max-w-auto">
                  {row.original.name}
                </span>
                <span className="md:hidden text-xs/3">
                  <FormattedNumber
                    value={row.original.state?.apy ?? 0}
                    style="percent"
                    minimumFractionDigits={2}
                  />
                  {NON_BREAKING_SPACE}APY
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
        header: "Supply",
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-between space-x-4">
              <div
                className={cn(
                  "flex flex-col items-start space-x-0 space-y-1",
                  "md:flex-row md:items-center md:space-x-3 md:space-y-0",
                )}
              >
                <span
                  className={cn(
                    "text-xs/3 truncate max-w-[25vw]",
                    "md:text-base/4 md:max-w-auto",
                  )}
                >
                  <FormattedNumber
                    value={
                      +new Big(row.original.state?.totalAssets ?? 0)
                        .div(10 ** row.original.asset.decimals)
                        .toFixed(2)
                    }
                  />
                  {NON_BREAKING_SPACE}
                  {row.original.symbol}
                </span>
                <Badge>
                  <FormattedNumber
                    value={
                      +new Big(row.original.state?.totalAssetsUsd ?? 0).toFixed(
                        2,
                      )
                    }
                    style="currency"
                    currency="USD"
                  />
                </Badge>
              </div>
              <div className="md:hidden flex justify-end pr-3">
                <CaretRightIcon className="text-text-subdued" size={16} />
              </div>
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

  return (
    <PageContext.Provider
      value={{
        table,
        currentPage,
        setCurrentPage,
        search,
        setSearch,
        orderBy,
        orderDirection,
        query,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
