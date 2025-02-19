import Big from "big.js";

const BILLION = "1000000000";
const MILLION = "1000000";
const THOUSAND = "1000";

/**
 * @param value A numeric string to format.
 * @returns The formatted numeric string and the suffix (K, M, B) to make large numbers more readable.
 */
export const formatAbbreviatedNumber = ({
  value,
  dp,
}: {
  value: string;
  dp?: number;
}) => {
  const big = new Big(value);

  if (big.gte(BILLION)) {
    return { value: big.div(BILLION).toFixed(dp), suffix: "B" };
  }

  if (big.gte(MILLION)) {
    return { value: big.div(MILLION).toFixed(dp), suffix: "M" };
  }

  if (big.gte(THOUSAND)) {
    return { value: big.div(THOUSAND).toFixed(dp), suffix: "K" };
  }

  return { value, suffix: "" };
};
