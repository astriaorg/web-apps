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
import { useFormatAbbreviatedNumber } from "@repo/ui/hooks";
import { ChevronRightSmallIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
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
import { MarketAssets } from "earn/components/market";
import { ROUTES } from "earn/constants/routes";
import { NON_BREAKING_SPACE } from "earn/constants/utils";
import { Market, MarketOrderBy } from "earn/generated/gql/graphql";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { FormattedNumber } from "react-intl";

const HIDE_COLUMNS_CLASS_NAME =
  "data-[column-id=th-LoanAssetSymbol]:hidden data-[column-id=th-Lltv]:hidden data-[column-id=th-NetSupplyApy]:hidden lg:data-[column-id=th-LoanAssetSymbol]:table-cell lg:data-[column-id=th-Lltv]:table-cell lg:data-[column-id=th-NetSupplyApy]:table-cell";

interface MarketListTableProps {
  data?: Market[];
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  getHeaderIsActive: (header: Header<Market, unknown>) => boolean;
  getHeaderIsAscending: (header: Header<Market, unknown>) => boolean;
  isLoading: boolean;
}

export const MarketListTable = ({
  data,
  sorting,
  onSortingChange,
  getHeaderIsActive,
  getHeaderIsAscending,
  isLoading,
}: MarketListTableProps) => {
  const router = useRouter();
  const { formatAbbreviatedNumber } = useFormatAbbreviatedNumber();

  const columnHelper = createColumnHelper<Market>();

  const columns = useMemo(() => {
    // Use `MarketOrderBy` as ID for server-side sorting.
    return [
      columnHelper.accessor("collateralAsset.symbol", {
        id: MarketOrderBy.CollateralAssetSymbol,
        header: () => {
          return (
            <>
              <span className="hidden lg:block">Collateral</span>
              <span className="block lg:hidden">Collateral / Loan</span>
            </>
          );
        },
        cell: ({ row }) => {
          return (
            <>
              <div className="hidden items-center space-x-2 lg:flex">
                <Image
                  src={row.original.collateralAsset?.logoURI}
                  alt={row.original.collateralAsset?.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="truncate">
                  {row.original.collateralAsset?.symbol}
                </span>
              </div>
              <div className="flex items-center space-x-2 lg:hidden">
                <MarketAssets
                  assetA={row.original.collateralAsset}
                  assetB={row.original.loanAsset}
                  size={24}
                  className="lg:hidden"
                />
              </div>
            </>
          );
        },
        enableSorting: true,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("loanAsset.symbol", {
        id: MarketOrderBy.LoanAssetSymbol,
        header: "Loan",
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2">
              <Image
                src={row.original.loanAsset.logoURI}
                alt={row.original.loanAsset.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{row.original.loanAsset.symbol}</span>
            </div>
          );
        },
        enableSorting: true,
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("lltv", {
        id: MarketOrderBy.Lltv,
        header: "LLTV",
        cell: ({ row }) => {
          return (
            <FormattedNumber
              value={new Big(row.original.lltv ?? 0)
                .div(10 ** (row.original.collateralAsset?.decimals ?? 18))
                .toNumber()}
              style="percent"
              minimumFractionDigits={2}
            />
          );
        },
        enableSorting: true,
        footer: (info) => info.column.id,
      }),
      //   columnHelper.accessor("state.supplyAssets", {
      //     id: "market.state.supplyAssets",
      //     header: "Allocation %",
      //     cell: ({ row }) => {
      //       return (
      //         <div>
      //           <FormattedNumber
      //             value={
      //               +new Big(row.original.state?.supplyAssets ?? 0)
      //                 .div(data?.vaultByAddress.state?.totalAssets ?? 1)
      //                 .toFixed()
      //             }
      //             style="percent"
      //             minimumFractionDigits={2}
      //           />
      //         </div>
      //       );
      //     },
      //     enableSorting: true,
      //     sortingFn: (a, b) => {
      //       return new Big(a.original.state?.supplyAssets ?? 0)
      //         .sub(b.original.state?.supplyAssets ?? 0)
      //         .gt(0)
      //         ? 1
      //         : -1;
      //     },
      //     footer: (info) => info.column.id,
      //   }),
      columnHelper.accessor("state.liquidityAssetsUsd", {
        id: MarketOrderBy.TotalLiquidityUsd,
        header: "Liquidity",
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-between space-x-4">
              <div
                className={cn(
                  "flex flex-col items-start space-x-0 space-y-1",
                  "md:flex-row md:items-center md:space-x-3 md:space-y-0",
                )}
              >
                <span className={cn("truncate max-w-[25vw]", "md:max-w-auto")}>
                  {formatAbbreviatedNumber(
                    new Big(row.original.state?.liquidityAssets ?? 0)
                      .div(10 ** row.original.loanAsset.decimals)
                      .toFixed(),
                    { minimumFractionDigits: 2 },
                  )}
                  {NON_BREAKING_SPACE}
                  {row.original.loanAsset.symbol}
                </span>
                <Badge>
                  {formatAbbreviatedNumber(
                    (row.original.state?.liquidityAssetsUsd ?? 0).toString(),
                    {
                      style: "currency",
                      currency: "USD",
                    },
                  )}
                </Badge>
              </div>
              <div className="lg:hidden flex justify-end pr-3">
                <ChevronRightSmallIcon
                  className="text-typography-subdued"
                  size={16}
                />
              </div>
            </div>
          );
        },
        enableSorting: true,
        footer: (info) => info.column.id,
      }),
      //   columnHelper.accessor("supplyCapUsd", {
      //     id: "supplyCapUsd",
      //     header: "Cap",
      //     cell: ({ row }) => {
      //       // TODO: Generated type seems wrong? typeof row.original.supplyCapUsd === "number".
      //       // Carefully force conversion for now.
      //       try {
      //         // Display abnormal numbers with a "-" like Morpho.
      //         if (
      //           (row.original.supplyCapUsd as unknown as number) >
      //           Number.MAX_SAFE_INTEGER
      //         ) {
      //           return "-";
      //         }

      //         const { value, suffix } = formatAbbreviatedNumber(
      //           (row.original.supplyCapUsd as unknown as number).toString(),
      //           {
      //             minimumFractionDigits: 2,
      //           },
      //         );

      //         return (
      //           formatNumber(+value, {
      //             style: "currency",
      //             currency: "USD",
      //             minimumFractionDigits: 2,
      //           }) + suffix
      //         );
      //       } catch {} // eslint-disable-line no-empty

      //       return "-";
      //     },
      //     enableSorting: false,
      //     footer: (info) => info.column.id,
      //   }),
      columnHelper.accessor("state.netSupplyApy", {
        id: MarketOrderBy.NetSupplyApy,
        header: "APY",
        cell: ({ row }) => {
          return (
            <div>
              <FormattedNumber
                value={row.original.state?.netSupplyApy ?? 0}
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
  }, [columnHelper, formatAbbreviatedNumber]);

  const table = useReactTable<Market>({
    columns,
    data: (data ?? []) as Market[],
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
    <Card>
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
                  <div className="flex items-center space-x-2 whitespace-nowrap">
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
                router.push(ROUTES.MARKET_DETAILS + row.original.uniqueKey)
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
