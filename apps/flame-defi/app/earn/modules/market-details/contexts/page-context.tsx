import {
  CHART_TYPE,
  Charts as ChartsType,
  getTimeseriesOptions,
} from "earn/components/charts";
import { useFetchMarketByUniqueKey } from "earn/modules/market-details/hooks/use-fetch-market-by-unique-key";
import { useFetchMarketByUniqueKeyHistoricalState } from "earn/modules/market-details/hooks/use-fetch-market-by-unique-key-historical-state";
import { TOTAL_ASSETS_OPTION } from "earn/modules/market-details/types";
import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useMemo, useState } from "react";

import { ChartInterval } from "@repo/ui/components";

type Status = "error" | "empty" | "success";

type Charts = ChartsType<
  ReturnType<typeof useFetchMarketByUniqueKeyHistoricalState>
>;

export interface PageContextProps extends PropsWithChildren {
  key: string;
  charts: Charts;
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
      selectedOption: TOTAL_ASSETS_OPTION.BORROW,
    },
  });

  const query = useFetchMarketByUniqueKey({
    variables: {
      key: params.key,
    },
  });

  const queryAPYChart = useFetchMarketByUniqueKeyHistoricalState({
    variables: {
      key: params.key,
      type: CHART_TYPE.APY,
      options: getTimeseriesOptions(charts[CHART_TYPE.APY].selectedInterval),
    },
  });

  const queryTotalAssetsChart = useFetchMarketByUniqueKeyHistoricalState({
    variables: {
      key: params.key,
      type: CHART_TYPE.TOTAL_ASSETS,
      options: getTimeseriesOptions(
        charts[CHART_TYPE.TOTAL_ASSETS].selectedInterval,
      ),
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
