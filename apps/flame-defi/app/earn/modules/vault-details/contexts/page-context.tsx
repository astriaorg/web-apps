import { TimeseriesOptions } from "earn/gql/graphql";
import { useFetchVaultByAddress } from "earn/modules/vault-details/hooks/use-fetch-vault-by-address";
import { CHART_TYPE, ChartInterval } from "earn/modules/vault-details/types";
import { useParams } from "next/navigation";
import { createContext, PropsWithChildren, useMemo, useState } from "react";

type Charts = {
  [key in keyof typeof CHART_TYPE]: {
    selectedInterval: ChartInterval;
    setSelectedInterval: (value: ChartInterval) => void;
  };
};

export interface PageContextProps extends PropsWithChildren {
  address: string;
  charts: Charts;
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

  const [selectedAPYChartInterval, setSelectedAPYChartInterval] =
    useState<ChartInterval>("3m");
  const [
    selectedTotalSupplyChartInterval,
    setSelectedTotalSupplyChartInterval,
  ] = useState<ChartInterval>("3m");

  const dailyAPYOptions: TimeseriesOptions = useMemo(() => {
    if (selectedAPYChartInterval === "all") {
      return {
        startTimestamp: null,
        endTimestamp: null,
      };
    }

    // Timestamps change every second, so query is never cached.
    // Round down to the nearest 5 minutes to avoid this.
    const roundDownToNearest5Minutes = (timestamp: number) => {
      const msIn5Minutes = 5 * 60;
      return Math.floor(timestamp / msIn5Minutes) * msIn5Minutes;
    };

    const now = Date.now();
    const date = new Date();

    const { startTimestamp, endTimestamp } = (() => {
      switch (selectedAPYChartInterval) {
        case "1w": {
          date.setDate(date.getDate() - 7);
          return {
            startTimestamp: date.getTime(),
            endTimestamp: now,
          };
        }
        case "1m": {
          date.setMonth(date.getMonth() - 1);
          return {
            startTimestamp: date.getTime(),
            endTimestamp: now,
          };
        }
        case "3m": {
          date.setMonth(date.getMonth() - 3);
          return {
            startTimestamp: date.getTime(),
            endTimestamp: now,
          };
        }
      }
    })();

    return {
      startTimestamp: Math.floor(
        roundDownToNearest5Minutes(startTimestamp / 1000),
      ),
      endTimestamp: Math.floor(roundDownToNearest5Minutes(endTimestamp / 1000)),
    };
  }, [selectedAPYChartInterval]);

  const query = useFetchVaultByAddress({
    variables: {
      address: params.address,
      dailyAPYOptions,
    },
  });

  return (
    <PageContext.Provider
      value={{
        address: params.address,
        charts: {
          [CHART_TYPE.APY]: {
            selectedInterval: selectedAPYChartInterval,
            setSelectedInterval: setSelectedAPYChartInterval,
          },
          [CHART_TYPE.TOTAL_SUPPLY]: {
            selectedInterval: selectedTotalSupplyChartInterval,
            setSelectedInterval: setSelectedTotalSupplyChartInterval,
          },
        },
        query,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
