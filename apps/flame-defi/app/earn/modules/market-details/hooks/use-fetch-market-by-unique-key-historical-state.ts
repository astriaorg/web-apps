import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/use-config";
import {
  CHART_CACHE_TIME_MILLISECONDS,
  CHART_TYPE,
  getSortedAndScaledData,
} from "earn/components/charts";
import { graphql } from "earn/generated/gql";
import { TimeseriesOptions } from "earn/generated/gql/graphql";
import request from "graphql-request";

const query = graphql(`
  query MarketByUniqueKeyHistoricalState(
    $key: String!
    $chainId: Int
    $includeAPYData: Boolean!
    $includeTotalAssetsData: Boolean!
    $options: TimeseriesOptions
  ) {
    marketByUniqueKey(uniqueKey: $key, chainId: $chainId) {
      historicalState {
        dailyBorrowApy(options: $options) @include(if: $includeAPYData) {
          x
          y
        }
        borrowAssets(options: $options) @include(if: $includeTotalAssetsData) {
          x
          y
        }
        supplyAssets(options: $options) @include(if: $includeTotalAssetsData) {
          x
          y
        }
        liquidityAssets(options: $options)
          @include(if: $includeTotalAssetsData) {
          x
          y
        }
      }
      collateralAsset {
        decimals
      }
      loanAsset {
        decimals
      }
    }
  }
`);

export const useFetchMarketByUniqueKeyHistoricalState = ({
  variables: { type, ...variables },
}: {
  variables: {
    key: string;
    options: TimeseriesOptions;
    type: keyof typeof CHART_TYPE;
  };
}) => {
  const { earnAPIURL } = useConfig();

  return useQuery({
    queryKey: ["useFetchMarketByUniqueKeyHistoricalState", type, variables],
    queryFn: async () => {
      const result = await request(earnAPIURL, query, {
        ...variables,
        // TODO: Get chain ID from wallet context.
        chainId: 1,
        includeAPYData: type === CHART_TYPE.APY,
        includeTotalAssetsData: type === CHART_TYPE.TOTAL_ASSETS,
      });

      if (result.marketByUniqueKey.historicalState) {
        result.marketByUniqueKey.historicalState.dailyBorrowApy?.sort(
          (a, b) => a.x - b.x,
        );
        result.marketByUniqueKey.historicalState.borrowAssets =
          getSortedAndScaledData(
            result.marketByUniqueKey.historicalState.borrowAssets,
            result.marketByUniqueKey.loanAsset.decimals,
          );
        result.marketByUniqueKey.historicalState.supplyAssets =
          getSortedAndScaledData(
            result.marketByUniqueKey.historicalState.supplyAssets,
            result.marketByUniqueKey.collateralAsset?.decimals ?? 18,
          );
        result.marketByUniqueKey.historicalState.liquidityAssets =
          getSortedAndScaledData(
            result.marketByUniqueKey.historicalState.supplyAssets,
            result.marketByUniqueKey.loanAsset.decimals,
          );
      }

      return result;
    },
    gcTime: CHART_CACHE_TIME_MILLISECONDS,
    staleTime: CHART_CACHE_TIME_MILLISECONDS,
  });
};
