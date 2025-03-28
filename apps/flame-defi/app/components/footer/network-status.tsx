"use client";

import { DotIcon } from "@repo/ui/icons";
import React, { useEffect, useState } from "react";
import { useBlockNumber } from "wagmi";

export const NetworkStatus = (): React.ReactElement => {
  const [isNetworkHealthy, setIsNetworkHealthy] = useState(true);
  const { data: blockNumber, isError } = useBlockNumber({
    watch: true,
  });

  // Update health status based on block number fetching errors
  useEffect(() => {
    setIsNetworkHealthy(!isError);
  }, [isError]);

  const statusColor = isNetworkHealthy ? "text-green-500" : "text-red-500";

  return (
    <div className="flex items-center gap-2 text-sm">
      {blockNumber !== undefined && (
        <span className={`text-xs ${statusColor}`}>
          {blockNumber.toString()}
        </span>
      )}
      <DotIcon className={statusColor} size={8} />
    </div>
  );
};
