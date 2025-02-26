import {
  Table as BaseTable,
  Skeleton,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components";
import { ArrowDownIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import { flexRender } from "@tanstack/react-table";
import { ROUTES } from "earn/constants/routes";
import { OrderDirection } from "earn/gql/graphql";
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
                    <div
                      className={cn(
                        "cursor-pointer text-text-subdued hover:text-text hover:opacity-100",
                        "transform transition-transform duration-200",
                        header.id === orderBy ? "opacity-100" : "opacity-0",
                        orderDirection === OrderDirection.Asc && "rotate-180",
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <ArrowDownIcon aria-label="Sort" size={16} />
                    </div>
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
  );
};
