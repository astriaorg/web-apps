import { MultiTokenIcon } from "@repo/ui/components";
import { DotIcon } from "@repo/ui/icons";
import { createColumnHelper } from "@tanstack/react-table";
import { PoolPosition } from "pool/types";
import { useMemo, useState } from "react";
import { usePoolContext } from "./use-pool-context";

export const usePositionsTable = () => {
  const { poolPositions } = usePoolContext();
  const [hideClosedPositions, setHideClosedPositions] = useState(false);

  const filteredData = useMemo(
    () => poolPositions.filter((row) => !hideClosedPositions || row.inRange),
    [poolPositions, hideClosedPositions],
  );

  const columnHelper = createColumnHelper<PoolPosition>();
  const columns = useMemo(() => {
    return [
      columnHelper.accessor("symbolOne", {
        id: "yourPositions",
        header: `Your Positions (${poolPositions.length})`,
        cell: ({ row }) => {
          return (
            <div className="flex items-center space-x-2 md:space-x-4">
              <MultiTokenIcon
                symbols={[row.original.symbolOne, row.original.symbolTwo]}
                size={24}
                shift={10}
              />
              <span className="text-lg font-medium">
                {row.original.symbolOne}/{row.original.symbolTwo}
              </span>
              <span className="bg-surface-2 text-white text-sm px-3 py-1 rounded-xl group-hover:bg-black transition">
                {row.original.feePercent}
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
  }, [columnHelper, poolPositions]);

  return {
    tableData: filteredData,
    columns,
    hideClosedPositions,
    setHideClosedPositions,
  };
};
