import { useDebounce } from "@repo/ui/hooks";
import { CaretRightIcon } from "@repo/ui/icons";
import {
  createColumnHelper,
  getCoreRowModel,
  SortingState,
  Table,
  useReactTable,
} from "@tanstack/react-table";
import { Image } from "components/image";
import { VaultTotalSupply } from "earn/components/vault";
import { NON_BREAKING_SPACE } from "earn/constants/utils";
import {
  OrderDirection,
  Vault,
  VaultOrderBy,
} from "earn/generated/gql/graphql";
import {
  PAGE_SIZE,
  PLACEHOLDER_DATA,
  useFetchVaults,
} from "earn/modules/vault-list/hooks/use-fetch-vaults";
import { createContext, PropsWithChildren, useMemo, useState } from "react";
import { FormattedNumber } from "react-intl";

type Status = "error" | "empty" | "success";

export interface PageContextProps extends PropsWithChildren {
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
        id: VaultOrderBy.Name,
        header: "Vault Name",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2 md:space-x-4">
              <Image
                src={row.original.asset.logoURI}
                alt={row.original.name}
                width={30}
                height={30}
                className="rounded-full"
              />
              <div className="flex flex-col space-y-1 overflow-hidden">
                <span className="truncate max-w-[25vw] md:max-w-auto">
                  {row.original.name}
                </span>
                <span className="md:hidden">
                  <FormattedNumber
                    value={row.original.state?.netApy ?? 0}
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
        id: VaultOrderBy.TotalAssets,
        header: "Total Supply",
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-between space-x-4">
              <VaultTotalSupply
                state={row.original.state}
                decimals={row.original.asset.decimals}
                symbol={row.original.symbol}
              />
              <div className="md:hidden flex justify-end pr-3">
                <CaretRightIcon className="text-typography-subdued" size={16} />
              </div>
            </div>
          );
        },
        enableSorting: true,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("state.netApy", {
        id: VaultOrderBy.NetApy,
        header: () => {
          return (
            <div className="hidden md:block">
              <span>APY</span>
            </div>
          );
        },
        cell: (info) => {
          return (
            <div className="hidden md:block">
              <FormattedNumber
                value={info.getValue() ?? 0}
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
    <PageContext.Provider
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
    </PageContext.Provider>
  );
};
