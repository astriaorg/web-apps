import {
  Badge,
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
import { CaretRightIcon } from "@repo/ui/icons";
import { cn, formatAbbreviatedNumber } from "@repo/ui/utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Header,
  OnChangeFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Big from "big.js";
import { Image } from "components/image";
import { ROUTES } from "earn/constants/routes";
import { NON_BREAKING_SPACE } from "earn/constants/utils";
import { Vault, VaultOrderBy } from "earn/generated/gql/graphql";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { FormattedNumber } from "react-intl";

const HIDE_COLUMNS_CLASS_NAME =
  "data-[column-id=th-metadata.curators]:hidden data-[column-id=th-NetApy]:hidden lg:data-[column-id=th-metadata.curators]:table-cell lg:data-[column-id=th-NetApy]:table-cell";

interface VaultListTableProps {
  data?: Vault[];
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  getHeaderIsActive: (header: Header<Vault, unknown>) => boolean;
  getHeaderIsAscending: (header: Header<Vault, unknown>) => boolean;
  isLoading: boolean;
}

export const VaultListTable = ({
  data,
  sorting,
  onSortingChange,
  getHeaderIsActive,
  getHeaderIsAscending,
  isLoading,
}: VaultListTableProps) => {
  const router = useRouter();

  const columnHelper = createColumnHelper<Vault>();

  const columns = useMemo(() => {
    // Use `VaultOrderBy` as ID for server-side sorting.
    return [
      columnHelper.accessor("name", {
        id: VaultOrderBy.Name,
        header: "Vault Name",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Image
                src={row.original.asset.logoURI}
                alt={row.original.name}
                width={30}
                height={30}
                className="rounded-full"
              />
              <div className="flex flex-col space-y-1 overflow-hidden">
                <span className="truncate max-w-[25vw] lg:max-w-auto">
                  {row.original.name}
                </span>
                <span className="lg:hidden">
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
          const {
            value: formattedTotalAssets,
            suffix: formattedTotalAssetsSuffix,
          } = formatAbbreviatedNumber(
            new Big(row.original.state?.totalAssets ?? 0)
              .div(10 ** row.original.asset.decimals)
              .toFixed(),
            {
              minimumFractionDigits: 2,
            },
          );

          const {
            value: formattedTotalAssetsUSD,
            suffix: formattedTotalAssetsUSDSuffix,
          } = formatAbbreviatedNumber(
            new Big(row.original.state?.totalAssetsUsd ?? 0).toFixed(),
            {
              minimumFractionDigits: 2,
            },
          );

          return (
            <div className="flex items-center justify-between space-x-4">
              <div
                className={cn(
                  "flex flex-col items-start space-x-0 space-y-1",
                  "md:flex-row md:items-center md:space-x-3 md:space-y-0",
                )}
              >
                <span className={cn("truncate max-w-[25vw]", "md:max-w-auto")}>
                  {formattedTotalAssets}
                  {formattedTotalAssetsSuffix}
                  {NON_BREAKING_SPACE}
                  {row.original.asset.symbol}
                </span>
                <Badge>
                  <FormattedNumber
                    value={+formattedTotalAssetsUSD}
                    style="currency"
                    currency="USD"
                  />
                  {formattedTotalAssetsUSDSuffix}
                </Badge>
              </div>
              <div className="lg:hidden flex justify-end pr-3">
                <CaretRightIcon className="text-typography-subdued" size={16} />
              </div>
            </div>
          );
        },
        enableSorting: true,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("metadata.curators", {
        id: "metadata.curators",
        header: "Curator",
        cell: ({ row }) => {
          return row.original.metadata?.curators?.map((it, index) => (
            <span
              key={`curator_${index}`}
              className="flex items-center space-x-2"
            >
              <Image
                src={it.image}
                alt={it.name}
                width={16}
                height={16}
                className="rounded-full"
              />
              <span className="text-sm">{it.name}</span>
            </span>
          ));
        },
        enableSorting: false,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("state.netApy", {
        id: VaultOrderBy.NetApy,
        header: () => {
          return (
            <div className="hidden lg:block">
              <span>APY</span>
            </div>
          );
        },
        cell: (info) => {
          return (
            <div className="hidden lg:block">
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

  const table = useReactTable<Vault>({
    columns,
    data: (data ?? []) as Vault[],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange,
    enableSorting: true,
    enableSortingRemoval: false,
  });

  return (
    <Card className="overflow-x-hidden lg:overflow-x-auto">
      <BaseTable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={HIDE_COLUMNS_CLASS_NAME}
                  data-column-id={`th-${header.column.id}`}
                >
                  <div className="flex items-end space-x-2 whitespace-nowrap">
                    <div>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
                    {header.column.getCanSort() && (
                      <TableSortIcon
                        isActive={getHeaderIsActive(header)}
                        isAscending={getHeaderIsAscending(header)}
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
                isLoading && "pointer-events-none",
              )}
              onClick={() =>
                router.push(ROUTES.VAULT_DETAILS + row.original.address)
              }
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={HIDE_COLUMNS_CLASS_NAME}
                  data-column-id={`th-${cell.column.id}`}
                >
                  <Skeleton isLoading={isLoading} className="h-8">
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
