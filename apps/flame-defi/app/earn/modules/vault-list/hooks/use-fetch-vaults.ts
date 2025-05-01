import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";

import { useConfig } from "config/hooks/use-config";
import { graphql } from "earn/generated/gql";
import {
  OrderDirection,
  VaultFilters,
  VaultOrderBy,
} from "earn/generated/gql/graphql";

export const PAGE_SIZE = 25;

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
