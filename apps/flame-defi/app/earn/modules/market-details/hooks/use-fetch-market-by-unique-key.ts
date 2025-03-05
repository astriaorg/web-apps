import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/use-config";
import { graphql } from "earn/gql";
import request from "graphql-request";

const query = graphql(`
  query MarketByUniqueKey($key: String!) {
    marketByUniqueKey(uniqueKey: $key) {
      collateralAsset {
        decimals
        logoURI
        name
        symbol
      }
      lltv
      loanAsset {
        logoURI
        symbol
      }
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
      return request(earnAPIURL, query, variables);
    },
  });
};
