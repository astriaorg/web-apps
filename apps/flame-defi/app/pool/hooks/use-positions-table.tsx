import { MultiTokenIcon } from "@repo/ui/components";
import { DotIcon } from "@repo/ui/icons";
import { createColumnHelper } from "@tanstack/react-table";
import { PoolPositionsTableData } from "pool/types";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { usePoolContext } from "./use-pool-context";

export const usePositionsTable = () => {
  const { formatNumber } = useIntl();
  const { poolPositionsTableData } = usePoolContext();
  const [hideClosedPositions, setHideClosedPositions] = useState(false);

  const filteredData = useMemo(
    () =>
      poolPositionsTableData.filter(
        (row) => !hideClosedPositions || row.inRange,
      ),
    [poolPositionsTableData, hideClosedPositions],
  );

  const columnHelper = createColumnHelper<PoolPositionsTableData>();
  const columns = useMemo(() => {
    return [
      columnHelper.accessor("position", {
        id: "yourPositions",
        header: `Your Positions (${poolPositionsTableData.length})`,
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2 md:space-x-4">
              <MultiTokenIcon
                symbols={[
                  row.original.position.symbol,
                  row.original.position.symbolTwo,
                ]}
                size={24}
                shift={10}
              />
              <span className="text-lg font-medium">
                {row.original.position.symbol}/{row.original.position.symbolTwo}
              </span>
              <span className="bg-surface-2 text-white text-sm px-3 py-1 rounded-xl group-hover:bg-black transition">
                {formatNumber(row.original.position.percent, {
                  style: "percent",
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor("positionStatus", {
        id: "positionStatus",
        header: "Hide Closed Positions",
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-end w-full space-x-2 md:space-x-4">
              <span className="bg-surface-2 text-white text-sm px-3 py-1 rounded-xl group-hover:bg-black transition flex items-center gap-2">
                {row.original.inRange && (
                  <DotIcon size={12} className="fill-green" />
                )}
                {row.original.positionStatus}
              </span>
            </div>
          );
        },
      }),
    ];
  }, [columnHelper, poolPositionsTableData, formatNumber]);

  return {
    tableData: filteredData,
    columns,
    hideClosedPositions,
    setHideClosedPositions,
  };
};
