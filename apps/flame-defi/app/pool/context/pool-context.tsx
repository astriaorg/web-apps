"use client";

import { TXN_STATUS } from "@repo/flame-types";
import { PoolContextProps } from "pool/types";
import { createContext, PropsWithChildren, useState } from "react";

export const PoolContext = createContext<PoolContextProps | undefined>(
  undefined,
);

const poolPositionsRecord = [
  {
    position: {
      id: 0,
      symbol: "TIA",
      symbolTwo: "milkTIA",
      percent: 0.0005,
      apr: 0.12,
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
      apr: 0.1,
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
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);

  return (
    <PoolContext.Provider
      value={{
        feeData,
        poolPositionsRecord,
        modalOpen,
        setModalOpen,
        txnStatus,
        setTxnStatus,
      }}
    >
      {children}
    </PoolContext.Provider>
  );
};
