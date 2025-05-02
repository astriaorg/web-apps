import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import {
  Skeleton,
  Table as BaseTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { ROUTES } from "pool/constants/routes";
import { usePositionsTable } from "pool/hooks";
import { usePoolContext } from "pool/hooks";

export const PositionsTable = () => {
  const router = useRouter();
  const { poolPositionsLoading } = usePoolContext();
  const { tableData, columns, hideClosedPositions, setHideClosedPositions } =
    usePositionsTable();
  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <BaseTable className="w-full text-left whitespace-nowrap">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className={cn("h-12 px-3 first:pl-6 last:pr-6")}
                onClick={() =>
                  header.column.id === "positionStatus" &&
                  setHideClosedPositions(!hideClosedPositions)
                }
              >
                <div
                  className={cn(
                    "flex items-end space-x-2",
                    header.column.id === "positionStatus" &&
                      "justify-end cursor-pointer underline",
                  )}
                >
                  <div className="text-xs/3 text-text-subdued font-medium tracking-wider uppercase">
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
            className="group cursor-pointer"
            onClick={() => router.push(`${ROUTES.POOL}${row.original.tokenId}`)}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cn(
                  "h-[72px] px-3 first:pl-6 last:pr-6 text-sm group-hover:bg-surface-2 transition",
                  Number(row.id) === table.getRowModel().rows.length - 1 &&
                    "last:rounded-b-xl first:rounded-bl-xl",
                  poolPositionsLoading && "pointer-events-none",
                )}
              >
                <Skeleton className="h-8" isLoading={poolPositionsLoading}>
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

export default PositionsTable;
