"use client";

import { PoolContextProps } from "pool/types";
import { createContext, PropsWithChildren } from "react";

export const PoolContext = createContext<PoolContextProps | undefined>(
  undefined,
);

const poolPositionsTableData = [
  {
    position: {
      id: 0,
      symbol: "TIA",
      symbolTwo: "milkTIA",
      percent: 0.0005,
    },
    inRange: true,
    positionStatus: "In range",
  },
  {
    position: {
      id: 1,
      symbol: "TIA",
      symbolTwo: "USDC",
      percent: 0.0005,
    },
    inRange: false,
    positionStatus: "Closed",
  },
];

const feeData = [
  {
    id: 0,
    feePercent: "0.01%",
    text: "Best for very stable pairs",
    tvl: "100M",
    selectPercent: "0.01%",
  },
  {
    id: 1,
    feePercent: "0.05%",
    text: "Best for stable pairs.",
    tvl: "100M",
    selectPercent: "0.05%",
  },
  {
    id: 2,
    feePercent: "0.3%",
    text: "Best for most pairs.",
    tvl: "100M",
    selectPercent: "0.3%",
  },
  {
    id: 3,
    feePercent: "1%",
    text: "Best for exotic pairs.",
    tvl: "100M",
    selectPercent: "1%",
  },
];

export const PoolContextProvider = ({ children }: PropsWithChildren) => {
  return (
    <PoolContext.Provider
      value={{
        feeData,
        poolPositionsTableData,
      }}
    >
      {children}
    </PoolContext.Provider>
  );
};
