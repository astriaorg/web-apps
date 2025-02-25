import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/use-config";
import { graphql } from "earn/gql";
import { TimeseriesOptions } from "earn/gql/graphql";
import {
  CHART_CACHE_TIME_MILLISECONDS,
  CHART_TYPE,
} from "earn/modules/vault-details/types";
import request from "graphql-request";

const query = graphql(`
  query VaultByAddressHistoricalState(
    $address: String!
    $chainId: Int
    $includeAPYData: Boolean!
    $includeTotalSupplyData: Boolean!
    $options: TimeseriesOptions
  ) {
    vaultByAddress(address: $address, chainId: $chainId) {
      historicalState {
        dailyApy(options: $options) @include(if: $includeAPYData) {
          x
          y
        }
        totalAssetsUsd(options: $options)
          @include(if: $includeTotalSupplyData) {
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
        chainId: 1,
        includeAPYData: type === CHART_TYPE.APY,
        includeTotalSupplyData: type === CHART_TYPE.TOTAL_SUPPLY,
      });

      // Data doesn't come sorted from the API.
      result.vaultByAddress.historicalState.dailyApy?.sort((a, b) => a.x - b.x);
      result.vaultByAddress.historicalState.totalAssetsUsd?.sort(
        (a, b) => a.x - b.x,
      );

      return result;
    },
    gcTime: CHART_CACHE_TIME_MILLISECONDS,
    staleTime: CHART_CACHE_TIME_MILLISECONDS,
  });
};
