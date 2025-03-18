import { ChartInterval } from "@repo/ui/components";
import { CHART_TYPE, getTimeseriesOptions } from "earn/components/charts";
import { useFetchMarketByUniqueKey } from "earn/modules/market-details/hooks/use-fetch-market-by-unique-key";
import { useFetchMarketByUniqueKeyHistoricalState } from "earn/modules/market-details/hooks/use-fetch-market-by-unique-key-historical-state";
import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useMemo, useState } from "react";

type Status = "error" | "empty" | "success";

type Charts = {
  [key in keyof typeof CHART_TYPE]: {
    selectedInterval: ChartInterval;
    setSelectedInterval: (value: ChartInterval) => void;
    query: ReturnType<typeof useFetchMarketByUniqueKeyHistoricalState>;
  };
};

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
    };
  }>({
    [CHART_TYPE.APY]: {
      selectedInterval: "3m",
    },
    [CHART_TYPE.TOTAL_ASSETS]: {
      selectedInterval: "3m",
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
