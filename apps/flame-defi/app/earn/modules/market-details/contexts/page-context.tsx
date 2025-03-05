import { useFetchMarketByUniqueKey } from "earn/modules/market-details/hooks/use-fetch-market-by-unique-key";
import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useMemo } from "react";

type Status = "error" | "empty" | "success";

export interface PageContextProps extends PropsWithChildren {
  key: string;
  status: Status;
  query: ReturnType<typeof useFetchMarketByUniqueKey>;
}

export const PageContext = createContext<PageContextProps | undefined>(
  undefined,
);

export const PageContextProvider = ({ children }: PropsWithChildren) => {
  const params = useParams<{ key: string }>();

  if (!params.key) {
    throw new Error(`Route missing param 'key'.`);
  }

  const query = useFetchMarketByUniqueKey({
    variables: {
      key: params.key,
    },
  });

  const status = useMemo<Status>(() => {
    if (query.isError) {
      return "error";
    }

    return "success";
  }, [query.isError]);

  return (
    <PageContext.Provider
      value={{
        key: params.key,
        status,
        query,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
