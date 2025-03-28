"use client";

import { DotIcon } from "@repo/ui/icons";
import { useEffect, useState } from "react";
import { useBlockNumber } from "wagmi";

export const NetworkStatus = () => {
  const { data: blockNumber, isError } = useBlockNumber({
    watch: true,
  });

  const [isNetworkHealthy, setIsNetworkHealthy] = useState(true);

  // Update health status based on block number fetching errors.
  useEffect(() => {
    setIsNetworkHealthy(!isError);
  }, [isError]);

  if (blockNumber === undefined) {
    return null;
  }

  return (
    <div
      className={`flex items-center space-x-1 bg-black rounded-xl px-1.5 py-1 text-[8px]/2 font-medium font-mono ${isNetworkHealthy ? "text-success" : "text-danger"}`}
    >
      <span>{blockNumber.toString()}</span>
      <DotIcon size={9} />
    </div>
  );
};
