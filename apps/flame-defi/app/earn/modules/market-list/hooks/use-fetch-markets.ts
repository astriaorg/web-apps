import { useQuery } from "@tanstack/react-query";
import { graphql } from "earn/generated/gql";
import {
  MarketFilters,
  MarketOrderBy,
  OrderDirection,
} from "earn/generated/gql/graphql";
import request from "graphql-request";

import { useConfig } from "config/hooks/use-config";

export const PAGE_SIZE = 25;

const query = graphql(`
  query Markets(
    $first: Int
    $skip: Int
    $orderBy: MarketOrderBy
    $orderDirection: OrderDirection
    $where: MarketFilters
  ) {
    markets(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      items {
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
      pageInfo {
        countTotal
        count
        limit
        skip
      }
    }
  }
`);

export const useFetchMarkets = ({
  variables,
}: {
  variables: {
    first: number;
    skip: number;
    orderBy: MarketOrderBy;
    orderDirection: OrderDirection;
    where: MarketFilters;
  };
}) => {
  const { earnAPIURL } = useConfig();

  return useQuery({
    queryKey: ["useFetchMarkets", variables],
    queryFn: async () => {
      return request(earnAPIURL, query, variables);
    },
  });
};
