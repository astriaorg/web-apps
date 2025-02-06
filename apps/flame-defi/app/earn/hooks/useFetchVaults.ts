import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/useConfig";
import { graphql } from "earn/gql";
import { VaultsQuery } from "earn/gql/graphql";
import request from "graphql-request";

const PAGE_SIZE = 25;

export const PLACEHOLDER_DATA: VaultsQuery = {
  vaults: {
    items: Array.from({ length: PAGE_SIZE }).map((_, index) => ({
      address: `0x${index}`,
      symbol: "ETH",
      name: "Ethereum",
      creationTimestamp: 0,
      asset: {
        id: `0x${index}`,
        address: `0x${index}`,
        decimals: 18,
        logoURI: "",
      },
      chain: {
        id: 0,
        network: "",
      },
      metadata: {
        curators: [
          {
            name: "",
            image: "",
          },
        ],
      },
      state: {
        id: `0x${index}`,
        apy: 0,
        netApy: 0,
        totalAssets: 0,
        totalAssetsUsd: 0,
      },
    })),
  },
};

const query = graphql(`
  query Vaults {
    vaults(where: { totalAssets_gte: 1 }) {
      items {
        address
        symbol
        name
        creationTimestamp
        asset {
          id
          address
          decimals
          logoURI
        }
        chain {
          id
          network
        }
        metadata {
          curators {
            name
            image
          }
        }
        state {
          id
          apy
          netApy
          totalAssets
          totalAssetsUsd
        }
      }
    }
  }
`);

export const useFetchVaults = () => {
  const { earnAPIURL } = useConfig();

  return useQuery({
    queryKey: ["data"],
    queryFn: async () => {
      return request(earnAPIURL, query);
    },
  });
};
