"use client";

import { ArrowDownIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/lib";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  renderPaginationItems,
  Skeleton,
} from "@repo/ui/shadcn-primitives";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import Big from "big.js";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import { FormattedNumber } from "react-intl";
import { OrderDirection, Vault, VaultOrderBy } from "./gql/graphql";
import {
  PAGE_SIZE,
  PLACEHOLDER_DATA,
  useFetchVaults,
} from "./hooks/useFetchVaults";

export default function EarnPage(): React.ReactElement {
  const [currentPage, setCurrentPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);

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

  const { data, isPending } = useFetchVaults({
    variables: {
      first: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
      orderBy,
      orderDirection,
    },
  });

  const totalPages = Math.ceil(
    (data?.vaults?.pageInfo?.countTotal ?? 0) / PAGE_SIZE,
  );

  const columnHelper = createColumnHelper<Vault>();

  const columns = React.useMemo(() => {
    // Use `VaultOrderBy` as ID for sorting.
    return [
      columnHelper.accessor("name", {
        id: "name",
        header: "Vault Name",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2">
              {row.original.asset.logoURI && (
                <Image
                  src={row.original.asset.logoURI}
                  alt={row.original.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>{row.original.name}</span>
            </div>
          );
        },
        enableSorting: false,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("state.totalAssets", {
        id: "TotalAssets",
        header: "Total Assets",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-4">
              <span>
                <FormattedNumber
                  value={
                    +new Big(row.original.state?.totalAssets ?? 0)
                      .div(10 ** row.original.asset.decimals)
                      .toFixed(2)
                  }
                />
                &nbsp;
                {row.original.symbol}
              </span>
              <span className="text-sm text-secondary bg-muted-foreground px-2 py-0.5 rounded-sm">
                <FormattedNumber
                  value={
                    +new Big(row.original.state?.totalAssetsUsd ?? 0).toFixed(2)
                  }
                  style="currency"
                  currency="USD"
                />
              </span>
            </div>
          );
        },
        enableSorting: true,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("state.apy", {
        id: "Apy",
        header: "APY",
        cell: (info) => {
          return (
            <div>
              <FormattedNumber
                value={info.getValue()}
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
    if (isPending) {
      return PLACEHOLDER_DATA.vaults.items as Vault[];
    }

    return data?.vaults.items ? (data.vaults.items as Vault[]) : [];
  }, [data, isPending]);

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

  return (
    <section className="flex flex-col p-20">
      <div className="rounded-lg overflow-x-auto bg-semi-white">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="h-16 px-5 text-left">
                    <div className="flex items-center space-x-2">
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </div>
                      {header.column.getCanSort() && (
                        <div
                          className={cn(
                            "cursor-pointer text-grey-light hover:text-white hover:opacity-100",
                            header.id === orderBy ? "opacity-100" : "opacity-0",
                            orderDirection === OrderDirection.Asc &&
                              "rotate-180",
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
              <tr key={row.id} className="whitespace-nowrap">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="h-12 px-5 border-t border-grey-dark"
                  >
                    <Skeleton isLoading={isPending}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Skeleton>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-10">
        <Skeleton isLoading={isPending} className="w-[200px]">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  isDisabled={currentPage === 1}
                />
              </PaginationItem>
              {renderPaginationItems({
                totalPages,
                currentPage,
                setCurrentPage,
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Skeleton>
      </div>
    </section>
  );
}
