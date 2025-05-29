/**
 * This file contains shared query keys used in `react-query` for caching and invalidating queries.
 *
 * It is important to use unique keys for each query to avoid conflicts and ensure correct data fetching.
 * The keys should be descriptive and follow a consistent naming convention.
 */
export const QUERY_KEYS = {
  USE_MINT: "USE_MINT",
  USE_GET_POOLS: "USE_GET_POOLS",
  USE_GET_POSITION: "USE_GET_POSITION",
  USE_GET_POSITIONS: "USE_GET_POSITIONS",
  USE_POSITIONS: "USE_POSITIONS",
};
