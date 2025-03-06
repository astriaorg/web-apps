import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/use-config";
import { graphql } from "earn/gql";
import request from "graphql-request";

const query = graphql(`
  query MarketByUniqueKey($key: String!, $chainId: Int) {
    marketByUniqueKey(uniqueKey: $key, chainId: $chainId) {
      collateralAsset {
        decimals
        logoURI
        name
        symbol
      }
      creationTimestamp
      lltv
      loanAsset {
        decimals
        logoURI
        symbol
      }
      state {
        collateralAssets
        liquidityAssets
        netBorrowApy
      }
      supplyingVaults {
        address
        asset {
          decimals
          logoURI
          name
          symbol
        }
        metadata {
          curators {
            image
            name
          }
        }
        name
        state {
          totalAssets
          totalAssetsUsd
          totalSupply
        }
      }
    }
  }
`);

export const useFetchMarketByUniqueKey = ({
  variables,
}: {
  variables: {
    key: string;
  };
}) => {
  const { earnAPIURL } = useConfig();

  return useQuery({
    queryKey: ["useFetchMarketByUniqueKey", variables],
    queryFn: async () => {
      return request(earnAPIURL, query, {
        ...variables,
        // TODO: Get chain ID from wallet context.
        chainId: 1,
      });
    },
  });
};
