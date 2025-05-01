import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";

import { useConfig } from "config/hooks/use-config";
import {
  CHART_CACHE_TIME_MILLISECONDS,
  CHART_TYPE,
  getSortedAndScaledData,
} from "earn/components/charts";
import { graphql } from "earn/generated/gql";
import { TimeseriesOptions } from "earn/generated/gql/graphql";

const query = graphql(`
  query VaultByAddressHistoricalState(
    $address: String!
    $chainId: Int
    $includeAPYData: Boolean!
    $includeTotalAssetsData: Boolean!
    $options: TimeseriesOptions
  ) {
    vaultByAddress(address: $address, chainId: $chainId) {
      asset {
        decimals
      }
      historicalState {
        dailyApy(options: $options) @include(if: $includeAPYData) {
          x
          y
        }
        totalAssets(options: $options) @include(if: $includeTotalAssetsData) {
          x
          y
        }
        totalAssetsUsd(options: $options)
          @include(if: $includeTotalAssetsData) {
          x
          y
        }
      }
    }
  }
`);

export const useFetchVaultByAddressHistoricalState = ({
  variables: { type, ...variables },
}: {
  variables: {
    address: string;
    options: TimeseriesOptions;
    type: keyof typeof CHART_TYPE;
  };
}) => {
  const { earnAPIURL } = useConfig();

  return useQuery({
    queryKey: ["useFetchVaultByAddressHistoricalState", type, variables],
    queryFn: async () => {
      const result = await request(earnAPIURL, query, {
        ...variables,
        // TODO: Get chain ID from wallet context.
        chainId: null,
        includeAPYData: type === CHART_TYPE.APY,
        includeTotalAssetsData: type === CHART_TYPE.TOTAL_ASSETS,
      });

      // Data doesn't come sorted from the API.
      result.vaultByAddress.historicalState.dailyApy?.sort((a, b) => a.x - b.x);
      result.vaultByAddress.historicalState.totalAssets =
        getSortedAndScaledData(
          result.vaultByAddress.historicalState.totalAssets,
          result.vaultByAddress.asset.decimals,
        );
      result.vaultByAddress.historicalState.totalAssetsUsd?.sort(
        (a, b) => a.x - b.x,
      );

      return result;
    },
    gcTime: CHART_CACHE_TIME_MILLISECONDS,
    staleTime: CHART_CACHE_TIME_MILLISECONDS,
  });
};
