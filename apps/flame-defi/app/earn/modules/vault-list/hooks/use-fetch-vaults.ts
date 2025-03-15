import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/use-config";
import { graphql } from "earn/generated/gql";
import {
  OrderDirection,
  VaultFilters,
  VaultOrderBy,
  VaultsQuery,
} from "earn/generated/gql/graphql";
import request from "graphql-request";

export const PAGE_SIZE = 25;

export const PLACEHOLDER_DATA: VaultsQuery = {
  vaults: {
    items: Array.from({ length: PAGE_SIZE }).map((_, index) => ({
      address: `0x${index}`,
      symbol: "ETH",
      name: "Ethereum",
      asset: {
        address: `0x${index}`,
        decimals: 18,
        logoURI: "",
      },
      state: {
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
        asset {
          address
          decimals
          logoURI
        }
        state {
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
