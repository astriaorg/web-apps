import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/useConfig";
import { graphql } from "earn/gql";
import {
  OrderDirection,
  VaultFilters,
  VaultOrderBy,
  VaultsQuery,
} from "earn/gql/graphql";
import request from "graphql-request";

export const PAGE_SIZE = 25;

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
    pageInfo: {
      countTotal: PAGE_SIZE,
      count: PAGE_SIZE,
      limit: PAGE_SIZE,
      skip: 0,
    },
  },
};

const query = graphql(`
  query Vaults(
    $first: Int
    $skip: Int
    $orderBy: VaultOrderBy
    $orderDirection: OrderDirection
    $where: VaultFilters
  ) {
    vaults(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
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
      pageInfo {
        countTotal
        count
        limit
        skip
      }
    }
  }
`);

export const useFetchVaults = ({
  variables,
}: {
  variables: {
    first: number;
    skip: number;
    orderBy: VaultOrderBy;
    orderDirection: OrderDirection;
    where: VaultFilters;
  };
}) => {
  const { earnAPIURL } = useConfig();

  return useQuery({
    queryKey: ["useFetchVaults", variables],
    queryFn: async () => {
      return request(earnAPIURL, query, variables);
    },
  });
};
