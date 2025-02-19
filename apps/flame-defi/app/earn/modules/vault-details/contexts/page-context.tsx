import { TimeseriesOptions } from "earn/gql/graphql";
import { useFetchVaultByAddress } from "earn/modules/vault-details/hooks/useFetchVaultByAddress";
import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useMemo, useState } from "react";

type Status = "error" | "empty" | "success";

export interface PageContextProps extends PropsWithChildren {
  address: string;
  status: Status;
  dailyAPYOptions: TimeseriesOptions;
  setDailyAPYOptions: (value: TimeseriesOptions) => void;
  query: ReturnType<typeof useFetchVaultByAddress>;
}

export const PageContext = createContext<PageContextProps | undefined>(
  undefined,
);

export const PageContextProvider = ({ children }: PropsWithChildren) => {
  const params = useParams<{ address: string }>();

  if (!params.address) {
    throw new Error(`Route missing param 'address'.`);
  }

  const [dailyAPYOptions, setDailyAPYOptions] = useState<TimeseriesOptions>({
    startTimestamp: null,
    endTimestamp: null,
  });

  const query = useFetchVaultByAddress({
    variables: {
      address: params.address,
      dailyAPYOptions,
    },
  });

  const status = useMemo<Status>(() => {
    if (query.isError) {
      return "error";
    }

    if (!query.isPending && !query.data?.vaultByAddress) {
      return "empty";
    }

    return "success";
  }, [query.isError, query.isPending, query.data?.vaultByAddress]);

  return (
    <PageContext.Provider
      value={{
        address: params.address,
        status,
        dailyAPYOptions,
        setDailyAPYOptions,
        query,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
