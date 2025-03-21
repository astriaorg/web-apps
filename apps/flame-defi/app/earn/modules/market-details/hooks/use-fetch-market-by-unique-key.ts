import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/use-config";
import { graphql } from "earn/generated/gql";
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
        name
        symbol
      }
      state {
        borrowAssets
        collateralAssets
        liquidityAssets
        liquidityAssetsUsd
        netBorrowApy
        netSupplyApy
        supplyAssets
        supplyAssetsUsd
      }
      supplyingVaults {
        address
        symbol
        name
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
        state {
          netApy
          totalAssets
          totalAssetsUsd
        }
      }
      uniqueKey
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
