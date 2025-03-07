import {
  Table as BaseTable,
  Card,
  Skeleton,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortIcon,
} from "@repo/ui/components";
import { FormattedNumber } from "@repo/ui/intl";
import { cn } from "@repo/ui/utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Big from "big.js";
import { Image } from "components/image";
import { VaultCurators, VaultTotalSupply } from "earn/components/vault";
import { ROUTES } from "earn/constants/routes";
import { Vault } from "earn/generated/gql/graphql";
import { usePageContext } from "earn/modules/market-details/hooks/use-page-context";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export const Table = () => {
  const router = useRouter();
  const {
    query: { data, isError, isPending },
  } = usePageContext();

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "market.state.supplyAssets",
      desc: true,
    },
  ]);

  const columnHelper = createColumnHelper<Vault>();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("name", {
        id: "name",
        header: "Vault Listing",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2">
              <div className="flex items-center -space-x-2 shrink-0">
                <Image
                  src={row.original.asset.logoURI}
                  alt={row.original.asset.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <span className="truncate">{row.original.name}</span>
            </div>
          );
        },
        enableSorting: false,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("metadata.curators", {
        id: "metadata.curators",
        header: "Curator",
        cell: ({ row }) => {
          return (
            <VaultCurators
              curators={row.original.metadata?.curators}
              className="text-sm text-unset font-normal bg-transparent"
            />
          );
        },
        enableSorting: false,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("state.totalAssets", {
        id: "state.totalAssets",
        header: "Total Supply",
        cell: ({ row }) => {
          return (
            <VaultTotalSupply
              state={row.original.state}
              decimals={row.original.asset.decimals}
              symbol={row.original.asset.symbol}
            />
          );
        },
        enableSorting: false,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("state.totalSupply", {
        id: "state.totalSupply",
        header: "Supply Share",
        cell: ({ row }) => {
          return (
            <FormattedNumber
              value={
                +new Big(row.original.state?.totalSupply ?? 0)
                  .div(row.original.state?.totalAssets ?? 1)
                  .toFixed()
              }
              style="percent"
              minimumFractionDigits={2}
            />
          );
        },
        enableSorting: false,
        footer: (info) => info.column.id,
      }),
    ];
  }, [columnHelper]);

  const table = useReactTable<Vault>({
    columns,
    data: (data?.marketByUniqueKey.supplyingVaults ?? []) as Vault[],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    enableSorting: true,
    enableSortingRemoval: false,
  });

  if (isPending) {
    return (
      <Card padding="md">
        <Skeleton className="w-full h-12" />
      </Card>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <Card isLoading={isPending}>
      <BaseTable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  <div className="flex items-end space-x-2 whitespace-nowrap">
                    <div>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                    {header.column.getCanSort() && (
                      <TableSortIcon
                        isActive={header.id === sorting[0]?.id}
                        isAscending={
                          header.column.getNextSortingOrder() === "desc"
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(
                "hover:bg-surface-2 hover:cursor-pointer whitespace-nowrap",
                isPending && "pointer-events-none",
              )}
              onClick={() =>
                router.push(ROUTES.VAULT_DETAILS + row.original.address)
              }
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  <Skeleton isLoading={isPending} className="h-8">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Skeleton>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </BaseTable>
    </Card>
  );
};
