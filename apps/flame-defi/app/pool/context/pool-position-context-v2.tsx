"use client";

import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useState } from "react";

export interface PoolPositionContextProps {
  tokenId: string;
  invert: boolean;
  setInvert: (value: boolean) => void;
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

  return (
    <PoolPositionContext.Provider
      value={{
        tokenId,
        invert,
        setInvert,
      }}
    >
      {children}
    </PoolPositionContext.Provider>
  );
};
