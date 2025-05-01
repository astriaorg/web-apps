import {
  CHART_TYPE,
  Charts as ChartsType,
  getTimeseriesOptions,
} from "earn/components/charts";
import { useFetchVaultByAddress } from "earn/modules/vault-details/hooks/use-fetch-vault-by-address";
import { useFetchVaultByAddressHistoricalState } from "earn/modules/vault-details/hooks/use-fetch-vault-by-address-historical-state";
import { TOTAL_ASSETS_OPTION } from "earn/modules/vault-details/types";
import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useMemo, useState } from "react";

import { ChartInterval } from "@repo/ui/components";

type Status = "error" | "empty" | "success";

type Charts = ChartsType<
  ReturnType<typeof useFetchVaultByAddressHistoricalState>
>;

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
    [CHART_TYPE.TOTAL_ASSETS]: {
      selectedInterval: ChartInterval;
      selectedOption: string;
    };
  }>({
    [CHART_TYPE.APY]: {
      selectedInterval: "3m",
    },
    [CHART_TYPE.TOTAL_ASSETS]: {
      selectedInterval: "3m",
      selectedOption: TOTAL_ASSETS_OPTION.ASSET,
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

  const queryTotalAssetsChart = useFetchVaultByAddressHistoricalState({
    variables: {
      address: params.address,
      type: CHART_TYPE.TOTAL_ASSETS,
      options: getTimeseriesOptions(
        charts[CHART_TYPE.TOTAL_ASSETS].selectedInterval,
      ),
    },
  });

  const status = useMemo<Status>(() => {
    if (
      query.isError ||
      queryAPYChart.isError ||
      queryTotalAssetsChart.isError
    ) {
      return "error";
    }

    return "success";
  }, [query.isError, queryAPYChart.isError, queryTotalAssetsChart.isError]);

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
          [CHART_TYPE.TOTAL_ASSETS]: {
            selectedInterval: charts[CHART_TYPE.TOTAL_ASSETS].selectedInterval,
            setSelectedInterval: (value: ChartInterval) => {
              setCharts({
                ...charts,
                [CHART_TYPE.TOTAL_ASSETS]: {
                  ...charts[CHART_TYPE.TOTAL_ASSETS],
                  selectedInterval: value,
                },
              });
            },
            selectedOption: charts[CHART_TYPE.TOTAL_ASSETS].selectedOption,
            setSelectedOption: (value: string) => {
              setCharts({
                ...charts,
                [CHART_TYPE.TOTAL_ASSETS]: {
                  ...charts[CHART_TYPE.TOTAL_ASSETS],
                  selectedOption: value,
                },
              });
            },
            query: queryTotalAssetsChart,
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
