import { Vault } from "earn/generated/gql/graphql";

export const getPlaceholderData = (length: number): Vault[] =>
  Array.from({ length }).map(
    (_, index) =>
      ({
        address: `0x${index}`,
        symbol: "ETH",
        name: "Ethereum",
        asset: {
          address: `0x${index}`,
          decimals: 18,
          logoURI: "",
          symbol: "ETH",
        },
        state: {
          netApy: 0,
          totalAssets: 0,
          totalAssetsUsd: 0,
        },
      }) as Vault,
  );
