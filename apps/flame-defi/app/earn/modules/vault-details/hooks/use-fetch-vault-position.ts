import { useQuery } from "@tanstack/react-query";
import { useConfig } from "config/hooks/use-config";
import request from "graphql-request";

import { graphql } from "earn/generated/gql";

const query = graphql(`
  query VaultPosition($address: String!, $vault: String!, $chainId: Int) {
    vaultPosition(
      userAddress: $address
      vaultAddress: $vault
      chainId: $chainId
    ) {
      state {
        assets
      }
    }
  }
`);

export const useFetchVaultPosition = ({
  variables: { address, ...variables },
}: {
  variables: {
    address?: string;
    vault: string;
  };
}) => {
  const { earnAPIURL } = useConfig();

  return useQuery({
    enabled: !!address,
    // API will throw an error by design if the user has no position in the vault.
    // Disable retries so failed queries don't retry, causing the loader to keep re-appearing.
    retry: false,
    queryKey: ["useFetchVaultPosition", variables, address],
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
