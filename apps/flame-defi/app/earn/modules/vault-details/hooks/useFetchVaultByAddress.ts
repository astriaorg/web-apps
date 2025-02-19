import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/useConfig";
import { graphql } from "earn/gql";
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
  });
};
