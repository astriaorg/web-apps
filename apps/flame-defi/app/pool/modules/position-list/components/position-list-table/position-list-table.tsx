import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import {
  Badge,
  Card,
  MultiTokenIcon,
  Skeleton,
  Table as BaseTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components";
import { DotIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import { ROUTES } from "pool/constants/routes";
import {
  type GetPositionsResult,
  useGetPositions,
} from "pool/hooks/use-get-positions";
import { usePageContext } from "pool/modules/position-list/hooks/use-page-context";

import { getPlaceholderData } from "./position-list-table.utils";

export const PositionListTable = () => {
  const router = useRouter();
  const { formatNumber } = useIntl();
  const { data, isPending } = useGetPositions();
  const { isClosedPositionsShown } = usePageContext();

  const columnHelper = createColumnHelper<GetPositionsResult>();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("pool.token0", {
        id: "pool.token0",
        header: "Your Positions",
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <MultiTokenIcon
                symbols={[
                  row.original.pool.token0.coinDenom,
                  row.original.pool.token1.coinDenom,
                ]}
                size={24}
              />
              <span className="text-lg font-medium">
                {row.original.pool.token0.coinDenom}/
                {row.original.pool.token1.coinDenom}
              </span>
              <Badge>
                {formatNumber(row.original.pool.feeTier / 1000000, {
                  style: "percent",
                  maximumFractionDigits: 2,
                })}
              </Badge>
            </div>
          );
        },
      }),
      columnHelper.accessor("position.liquidity", {
        id: "position.liquidity",
        header: "Status",
        cell: ({ row }) => {
          const isPositionInRange = row.original.position.liquidity !== 0n;

          return (
            <Badge className="gap-1">
              {isPositionInRange && (
                <DotIcon size={12} className="fill-success" />
              )}
              {isPositionInRange ? "In Range" : "Closed"}
            </Badge>
          );
        },
      }),
    ];
  }, [columnHelper, formatNumber]);

  const filteredData: GetPositionsResult[] = useMemo(() => {
    if (isPending) {
      return getPlaceholderData(3);
    }

    if (!data) {
      return [];
    }

    if (isClosedPositionsShown) {
      return data;
    }

    return data.filter((it) => it.position.liquidity !== 0n);
  }, [data, isPending, isClosedPositionsShown]);

  const table = useReactTable<GetPositionsResult>({
    columns,
    data: filteredData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
    enableSortingRemoval: false,
  });

  return (
    <Card>
      <BaseTable>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  data-column-id={`th-${header.column.id}`}
                >
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <div>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </div>
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
                router.push(`${ROUTES.BASE}/${row.original.position.key}`)
              }
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  data-column-id={`th-${cell.column.id}`}
                >
                  <Skeleton isLoading={isPending}>
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
