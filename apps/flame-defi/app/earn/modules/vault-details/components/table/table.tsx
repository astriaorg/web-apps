import {
  Table as BaseTable,
  Skeleton,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortIcon,
} from "@repo/ui/components";
import { cn, formatAbbreviatedNumber } from "@repo/ui/utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Big from "big.js";
import { Image } from "earn/components/image";
import { VaultAllocationHistory } from "earn/gql/graphql";
import { usePageContext } from "earn/modules/vault-details/hooks/use-page-context";
import { useMemo, useState } from "react";
import { FormattedNumber, useIntl } from "react-intl";

export const Table = () => {
  const { formatNumber } = useIntl();
  const {
    query: { data, isPending },
  } = usePageContext();

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "market.state.supplyAssets",
      desc: true,
    },
  ]);

  const columnHelper = createColumnHelper<VaultAllocationHistory>();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("market.loanAsset.name", {
        id: "market.loanAsset.name",
        header: "Market Allocation",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2">
              <div className="flex items-center -space-x-2">
                {row.original.market.collateralAsset && (
                  <Image
                    src={row.original.market.collateralAsset.logoURI}
                    alt={row.original.market.collateralAsset.symbol}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <Image
                  src={row.original.market.loanAsset.logoURI}
                  alt={row.original.market.loanAsset.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
              <span>
                {row.original.market.collateralAsset?.symbol}
                {row.original.market.collateralAsset?.symbol ? " / " : ""}
                {row.original.market.loanAsset.symbol}
              </span>
            </div>
          );
        },
        enableSorting: false,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("market.state.supplyAssets", {
        id: "market.state.supplyAssets",
        header: "Allocation %",
        cell: ({ row }) => {
          return (
            <div>
              <FormattedNumber
                value={
                  +new Big(row.original.market.state?.supplyAssets ?? 0)
                    .div(data?.vaultByAddress.state?.totalAssets ?? 1)
                    .toFixed()
                }
                style="percent"
                minimumFractionDigits={2}
              />
            </div>
          );
        },
        enableSorting: true,
        sortingFn: (a, b) => {
          return new Big(a.original.market.state?.supplyAssets ?? 0)
            .sub(b.original.market.state?.supplyAssets ?? 0)
            .gt(0)
            ? 1
            : -1;
        },
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("market.state.supplyAssetsUsd", {
        id: "market.state.supplyAssetsUsd",
        header: "Total Supply",
        cell: ({ row }) => {
          const { value, suffix } = formatAbbreviatedNumber(
            (row.original.market.state?.supplyAssetsUsd ?? 0).toString(),
            {
              minimumFractionDigits: 2,
            },
          );

          return (
            formatNumber(+value, {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
            }) + suffix
          );
        },
        enableSorting: false,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("supplyCapUsd", {
        id: "supplyCapUsd",
        header: "Cap",
        cell: ({ row }) => {
          // TODO: Generated type seems wrong? typeof row.original.supplyCapUsd === "number".
          // Carefully force conversion for now.
          try {
            // Display abnormal numbers with a "-" like Morpho.
            if (
              (row.original.supplyCapUsd as unknown as number) >
              Number.MAX_SAFE_INTEGER
            ) {
              return "-";
            }

            const { value, suffix } = formatAbbreviatedNumber(
              (row.original.supplyCapUsd as unknown as number).toString(),
              {
                minimumFractionDigits: 2,
              },
            );

            return (
              formatNumber(+value, {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
              }) + suffix
            );
          } catch {} // eslint-disable-line no-empty

          return "-";
        },
        enableSorting: false,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("market.state.netSupplyApy", {
        id: "market.state.netSupplyApy",
        header: "APY",
        cell: ({ row }) => {
          return (
            <div>
              <FormattedNumber
                value={row.original.market.state?.netSupplyApy ?? 0}
                style="percent"
                minimumFractionDigits={2}
              />
            </div>
          );
        },
        enableSorting: false,
        footer: (info) => info.column.id,
      }),
    ];
  }, [columnHelper, data?.vaultByAddress.state?.totalAssets, formatNumber]);

  const table = useReactTable<VaultAllocationHistory>({
    columns,
    data: (data?.vaultByAddress.state?.allocation ??
      []) as VaultAllocationHistory[],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    enableSorting: true,
    enableSortingRemoval: false,
  });

  return (
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
  );
};
