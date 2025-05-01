import { useQuery } from "@tanstack/react-query";
import { graphql } from "earn/generated/gql";
import request from "graphql-request";

import { useConfig } from "config/hooks/use-config";

const query = graphql(`
  query MarketPosition($address: String!, $key: String!, $chainId: Int) {
    marketPosition(
      userAddress: $address
      marketUniqueKey: $key
      chainId: $chainId
    ) {
      state {
        collateral
        borrowAssets
      }
    }
  }
`);

export const useFetchMarketPosition = ({
  variables: { address, ...variables },
}: {
  variables: {
    address?: string;
    key: string;
  };
}) => {
  const { earnAPIURL } = useConfig();

  return useQuery({
    enabled: !!address,
    retry: false,
    queryKey: ["useFetchMarketPosition", variables, address],
    queryFn: async () => {
      if (!address) {
        return;
      }

      return request(earnAPIURL, query, {
        ...variables,
        address,
        // TODO: Get chain ID from wallet context.
        chainId: 1,
      });
    },
  });
};
