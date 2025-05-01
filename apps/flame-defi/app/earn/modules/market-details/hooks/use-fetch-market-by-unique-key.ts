import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";

import { useConfig } from "config/hooks/use-config";
import { graphql } from "earn/generated/gql";

const query = graphql(`
  query MarketByUniqueKey($key: String!, $chainId: Int) {
    marketByUniqueKey(uniqueKey: $key, chainId: $chainId) {
      collateralAsset {
        address
        decimals
        logoURI
        name
        symbol
        priceUsd
      }
      creationTimestamp
      lltv
      loanAsset {
        address
        decimals
        logoURI
        name
        symbol
        priceUsd
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
