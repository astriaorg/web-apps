import { Market } from "earn/generated/gql/graphql";

export const getPlaceholderData = (length: number): Market[] =>
  Array.from({ length }).map(
    (_, index) =>
      ({
        collateralAsset: {
          address: `0x${index}`,
          decimals: 18,
          logoURI: "",
          symbol: "ETH",
        },
        creationTimestamp: 0,
        lltv: 0,
        loanAsset: {
          address: `0x${index}`,
          decimals: 18,
          logoURI: "",
          symbol: "ETH",
        },
        state: {
          netSupplyApy: 0,
          supplyAssets: 0,
          supplyAssetsUsd: 0,
        },
        uniqueKey: `0x${index}`,
      }) as Market,
  );
