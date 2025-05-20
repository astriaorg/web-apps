"use client";

import { useParams } from "next/navigation";
import { createContext, PropsWithChildren } from "react";

export interface PoolPositionContextProps {
  tokenId: string;
}

export const PoolPositionContext = createContext<
  PoolPositionContextProps | undefined
>(undefined);

export const PoolPositionContextProvider = ({
  children,
}: PropsWithChildren) => {
  const params = useParams();
  const tokenId = params["token-id"] as string;

  return (
    <PoolPositionContext.Provider
      value={{
        tokenId,
      }}
    >
      {children}
    </PoolPositionContext.Provider>
  );
};
