"use client";

import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useState } from "react";
import type { Address } from "viem";

import { TransactionStatus } from "@repo/flame-types";

export interface PoolPositionContextProps {
  tokenId: string;
  invert: boolean;
  setInvert: (value: boolean) => void;
  hash?: Address;
  setHash: (value?: Address) => void;
  error?: string;
  setError: (value?: string) => void;
  status: TransactionStatus;
  setStatus: (value: TransactionStatus) => void;
}

export const PoolPositionContext = createContext<
  PoolPositionContextProps | undefined
>(undefined);

export const PoolPositionContextProvider = ({
  children,
}: PropsWithChildren) => {
  const params = useParams();
  const tokenId = params["token-id"] as string;

  const [invert, setInvert] = useState(false);

  const [hash, setHash] = useState<Address>();
  const [error, setError] = useState<string>();
  const [status, setStatus] = useState<TransactionStatus>(
    TransactionStatus.IDLE,
  );

  return (
    <PoolPositionContext.Provider
      value={{
        tokenId,
        invert,
        setInvert,
        hash,
        setHash,
        error,
        setError,
        status,
        setStatus,
      }}
    >
      {children}
    </PoolPositionContext.Provider>
  );
};
