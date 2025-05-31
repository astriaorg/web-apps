"use client";

import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useState } from "react";
import type { Address } from "viem";

import { TransactionStatus } from "@repo/flame-types";

export interface PoolPositionContextProps {
  /**
   * The ID of the pool position, which is the non-fungible token ID.
   *
   * This is called `key` or `tokenId` in the contract.
   */
  positionId: string;
  invert: boolean;
  setInvert: (value: boolean) => void;
  hash?: Address;
  setHash: (value?: Address) => void;
  error?: Error;
  setError: (value?: Error) => void;
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
  const positionId = params["position-id"] as string;

  const [invert, setInvert] = useState(false);

  const [hash, setHash] = useState<Address>();
  const [error, setError] = useState<Error>();
  const [status, setStatus] = useState<TransactionStatus>(
    TransactionStatus.IDLE,
  );

  return (
    <PoolPositionContext.Provider
      value={{
        positionId,
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
