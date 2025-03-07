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
import { cn } from "@repo/ui/utils";
import { flexRender } from "@tanstack/react-table";
import { ROUTES } from "earn/constants/routes";
import { OrderDirection } from "earn/generated/gql/graphql";
import { usePageContext } from "earn/modules/vault-list/hooks/use-page-context";
import { useRouter } from "next/navigation";

export const Table = () => {
  const router = useRouter();
  const {
    table,
    orderBy,
    orderDirection,
    query: { isPending },
  } = usePageContext();

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
                        isActive={header.id === orderBy}
                        isAscending={orderDirection === OrderDirection.Asc}
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
                <TableCell
                  key={cell.id}
                  className="last:hidden md:last:table-cell"
                >
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
