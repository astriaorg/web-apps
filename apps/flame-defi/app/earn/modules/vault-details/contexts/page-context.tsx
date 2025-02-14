import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useMemo } from "react";

type Status = "error" | "empty" | "success";

export interface PageContextProps extends PropsWithChildren {
  id: string;
  status: Status;
  query: ReturnType<typeof useFetchVault>;
}

export const PageContext = createContext<PageContextProps | undefined>(
  undefined,
);

export const PageContextProvider = ({ children }: PropsWithChildren) => {
  const params = useParams<{ id: string }>();

  if (!params.id) {
    throw new Error(`Route missing param 'id'.`);
  }

  const query: any = null;

  const status = useMemo<Status>(() => {
    if (query.isError) {
      return "error";
    }

    if (!query.isPending && !query.data?.vaults?.items?.length) {
      return "empty";
    }

    return "success";
  }, [query.isError, query.isPending, query.data?.vaults?.items?.length]);

  return (
    <PageContext.Provider
      value={{
        id: params.id,
        status,
        query,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
