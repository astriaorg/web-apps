import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/useConfig";
import { graphql } from "earn/gql";
import { TimeseriesOptions } from "earn/gql/graphql";
import request from "graphql-request";

const query = graphql(`
  query VaultByAddress(
    $address: String!
    $chainId: Int
    $dailyAPYOptions: TimeseriesOptions
  ) {
    vaultByAddress(address: $address, chainId: $chainId) {
      address
      asset {
        decimals
        logoURI
        name
        symbol
      }
      historicalState {
        dailyApy(options: $dailyAPYOptions) {
          x
          y
        }
      }
      liquidity {
        underlying
        usd
      }
      metadata {
        curators {
          image
          name
        }
        description
      }
      name
      state {
        apy
        fee
        guardian
        totalAssets
        totalAssetsUsd
      }
      symbol
    }
  }
`);

export const useFetchVaultByAddress = ({
  variables,
}: {
  variables: {
    address: string;
    dailyAPYOptions: TimeseriesOptions;
  };
}) => {
  const { earnAPIURL } = useConfig();

  return useQuery({
    queryKey: ["useFetchVaults", variables],
    queryFn: async () => {
      return request(earnAPIURL, query, {
        ...variables,
        // TODO: Get chain ID from wallet context.
        chainId: 1,
      });
    },
    gcTime: 1000 * 60 * 5, // 5 minutes.
    staleTime: 1000 * 60 * 5,
  });
};
