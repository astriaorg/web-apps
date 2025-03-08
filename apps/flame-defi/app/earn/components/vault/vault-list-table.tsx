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
import { CaretRightIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  OnChangeFn,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Image } from "components/image";
import { VaultTotalSupply } from "earn/components/vault/vault-total-supply";
import { ROUTES } from "earn/constants/routes";
import { NON_BREAKING_SPACE } from "earn/constants/utils";
import {
  OrderDirection,
  Vault,
  VaultOrderBy,
} from "earn/generated/gql/graphql";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { FormattedNumber } from "react-intl";

interface VaultListTableProps {
  data?: Vault[];
  ordering?: {
    orderBy: VaultOrderBy;
    orderDirection: OrderDirection;
  };
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  isLoading: boolean;
}

export const VaultListTable = ({
  data,
  ordering,
  sorting,
  onSortingChange,
  isLoading,
}: VaultListTableProps) => {
  const router = useRouter();

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
    <Card className="overflow-x-hidden md:overflow-x-auto">
      <BaseTable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="last:hidden md:last:table-cell"
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
                        isActive={header.id === ordering?.orderBy}
                        isAscending={
                          ordering?.orderDirection === OrderDirection.Asc
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
                isLoading && "pointer-events-none",
              )}
              onClick={() =>
                router.push(ROUTES.VAULT_DETAILS + row.original.address)
              }
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="last:hidden md:last:table-cell"
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
