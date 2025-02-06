"use client";

import { Skeleton } from "@repo/ui/shadcn-primitives";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Big from "big.js";
import Image from "next/image";
import React, { useMemo } from "react";
import { FormattedNumber } from "react-intl";
import { Vault } from "./gql/graphql";
import { PLACEHOLDER_DATA, useFetchVaults } from "./hooks/useFetchVaults";

export default function EarnPage(): React.ReactElement {
  const { data, isPending } = useFetchVaults();

  const columnHelper = createColumnHelper<Vault>();

  const columns = React.useMemo(() => {
    return [
      columnHelper.accessor("name", {
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
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("state.totalAssets", {
        header: "Total Assets",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-4">
              <span>
                <FormattedNumber
                  value={
                    +new Big(row.original.state?.totalAssets ?? 0)
                      .div(row.original.asset.decimals)
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
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("state.apy", {
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
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("metadata.curators", {
        header: "Curator",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2">
              {row.original.metadata?.curators.map((it) => {
                if (!it.image) {
                  return null;
                }

                return (
                  <div
                    key={`${row.id}_${row.original.address}_${it.name}`}
                    className="flex items-center space-x-2"
                  >
                    <Image
                      src={it.image}
                      alt={it.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span>{it.name}</span>
                  </div>
                );
              })}
            </div>
          );
        },
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
  });

  return (
    <section className="flex flex-col p-20">
      <div className="rounded-lg overflow-x-auto bg-semi-white">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="h-16 pl-5 text-left">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
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
                    className="h-12 pl-5 last:pr-5 border-t border-grey-dark "
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
    </section>
  );
}
