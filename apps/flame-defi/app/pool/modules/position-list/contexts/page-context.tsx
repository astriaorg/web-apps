"use client";

import { createContext, PropsWithChildren, useMemo, useState } from "react";

import { useGetPositions } from "pool/hooks/use-get-positions";

type Status = "error" | "empty" | "success";

export interface PageContextProps extends PropsWithChildren {
  isClosedPositionsShown: boolean;
  setIsClosedPositionsShown: (value: boolean) => void;
  status: Status;
}

export const PageContext = createContext<PageContextProps | undefined>(
  undefined,
);

export const PageContextProvider = ({ children }: PropsWithChildren) => {
  const [isClosedPositionsShown, setIsClosedPositionsShown] = useState(false);

  const { data, isError, isPending } = useGetPositions();

  const status = useMemo<Status>(() => {
    if (isError) {
      return "error";
    }

    if (!isPending && !data?.length) {
      return "empty";
    }

    return "success";
  }, [isError, isPending, data?.length]);

  return (
    <PageContext.Provider
      value={{
        isClosedPositionsShown,
        setIsClosedPositionsShown,
        status,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
