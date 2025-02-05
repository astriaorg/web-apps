import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/useConfig";
import { graphql } from "earn/gql";
import request from "graphql-request";

const query = graphql(`
  query Vaults {
    vaults {
      items {
        address
        symbol
        name
        creationBlockNumber
        creationTimestamp
        creatorAddress
        whitelisted
        asset {
          id
          address
          decimals
        }
        chain {
          id
          network
        }
        state {
          id
          apy
          netApy
          totalAssets
          totalAssetsUsd
          fee
          timelock
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
      // TODO: Pagination.
      return request(earnAPIURL, query);
    },
  });
};
