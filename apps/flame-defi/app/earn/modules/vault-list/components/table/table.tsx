import { ArrowDownIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/lib";
import { Skeleton } from "@repo/ui/shadcn-primitives";
import { flexRender } from "@tanstack/react-table";
import { OrderDirection } from "earn/gql/graphql";
import { usePageContext } from "earn/modules/vault-list/hooks/usePageContext";

export const Table = () => {
  const {
    table,
    orderBy,
    orderDirection,
    query: { isPending },
  } = usePageContext();

  return (
    <table className="w-full text-left whitespace-nowrap">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className={cn(
                  "h-12 px-3 first:pl-6 last:hidden",
                  "md:last:table-cell",
                )}
              >
                <div className="flex items-end space-x-2">
                  <div className="text-xs/3 text-grey-light font-semibold tracking-widest uppercase">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </div>
                  {header.column.getCanSort() && (
                    <div
                      className={cn(
                        "cursor-pointer text-grey-light hover:text-white hover:opacity-100",
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
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="hover:bg-white/5">
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={cn(
                  "h-[72px] px-3 first:pl-6 last:hidden border-t border-dark text-sm",
                  "md:last:table-cell",
                )}
              >
                <Skeleton isLoading={isPending} className="h-8">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Skeleton>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
