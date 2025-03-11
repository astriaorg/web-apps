import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/use-config";
import { graphql } from "earn/generated/gql";
import request from "graphql-request";

const query = graphql(`
  query VaultByAddress($address: String!, $chainId: Int) {
    vaultByAddress(address: $address, chainId: $chainId) {
      address
      asset {
        decimals
        logoURI
        name
        symbol
      }
      liquidity {
        underlying
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
        allocation {
          market {
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
              collateralAssets
              liquidityAssets
              liquidityAssetsUsd
              netBorrowApy
              netSupplyApy
              supplyAssets
              supplyAssetsUsd
            }
            uniqueKey
          }
          supplyCapUsd
        }
        netApy
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
  };
}) => {
  const { earnAPIURL } = useConfig();

  return useQuery({
    queryKey: ["useFetchVaultsByAddress", variables],
    queryFn: async () => {
      return request(earnAPIURL, query, {
        ...variables,
        // TODO: Get chain ID from wallet context.
        chainId: null,
      });
    },
  });
};
