import { getTimeseriesOptions } from "earn/modules/vault-details/components/charts/charts.utils";
import { useFetchVaultByAddress } from "earn/modules/vault-details/hooks/use-fetch-vault-by-address";
import { useFetchVaultByAddressHistoricalState } from "earn/modules/vault-details/hooks/use-fetch-vault-by-address-historical-state";
import { CHART_TYPE, ChartInterval } from "earn/modules/vault-details/types";
import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useMemo, useState } from "react";

type Status = "error" | "empty" | "success";

type Charts = {
  [key in keyof typeof CHART_TYPE]: {
    selectedInterval: ChartInterval;
    setSelectedInterval: (value: ChartInterval) => void;
    query: ReturnType<typeof useFetchVaultByAddressHistoricalState>;
  };
};

export interface PageContextProps extends PropsWithChildren {
  address: string;
  charts: Charts;
  status: Status;
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

  const [charts, setCharts] = useState<{
    [CHART_TYPE.APY]: {
      selectedInterval: ChartInterval;
    };
    [CHART_TYPE.TOTAL_SUPPLY]: {
      // TODO: Add currency selector when we support more currencies.
      selectedInterval: ChartInterval;
    };
  }>({
    [CHART_TYPE.APY]: {
      selectedInterval: "3m",
    },
    [CHART_TYPE.TOTAL_SUPPLY]: {
      selectedInterval: "3m",
    },
  });

  const query = useFetchVaultByAddress({
    variables: {
      address: params.address,
    },
  });

  const queryAPYChart = useFetchVaultByAddressHistoricalState({
    variables: {
      address: params.address,
      type: CHART_TYPE.APY,
      options: getTimeseriesOptions(charts[CHART_TYPE.APY].selectedInterval),
    },
  });

  const queryTotalSupplyChart = useFetchVaultByAddressHistoricalState({
    variables: {
      address: params.address,
      type: CHART_TYPE.TOTAL_SUPPLY,
      options: getTimeseriesOptions(
        charts[CHART_TYPE.TOTAL_SUPPLY].selectedInterval,
      ),
    },
  });

  const status = useMemo<Status>(() => {
    if (
      query.isError ||
      queryAPYChart.isError ||
      queryTotalSupplyChart.isError
    ) {
      return "error";
    }

    return "success";
  }, [query.isError, queryAPYChart.isError, queryTotalSupplyChart.isError]);

  return (
    <PageContext.Provider
      value={{
        address: params.address,
        charts: {
          [CHART_TYPE.APY]: {
            selectedInterval: charts[CHART_TYPE.APY].selectedInterval,
            setSelectedInterval: (value: ChartInterval) => {
              setCharts({
                ...charts,
                [CHART_TYPE.APY]: {
                  selectedInterval: value,
                },
              });
            },
            query: queryAPYChart,
          },
          [CHART_TYPE.TOTAL_SUPPLY]: {
            selectedInterval: charts[CHART_TYPE.TOTAL_SUPPLY].selectedInterval,
            setSelectedInterval: (value: ChartInterval) => {
              setCharts({
                ...charts,
                [CHART_TYPE.TOTAL_SUPPLY]: {
                  selectedInterval: value,
                },
              });
            },
            query: queryTotalSupplyChart,
          },
        },
        status,
        query,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
