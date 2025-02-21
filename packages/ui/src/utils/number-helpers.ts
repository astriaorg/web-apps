import Big from "big.js";
import JSBI from "jsbi";
const allCommas = /,/g;

/**
 * @deprecated Use `formatNumber` from `react-intl` instead.
 * Specify `minimumFractionDigits`/`maximumFractionDigits` in the `options` parameter to format decimal places.
 */
export function formatNumber(num: string | number, decimals = 4) {
  const cleanedNumber =
    typeof num === "string" ? num.replace(allCommas, "") : num;

  return parseFloat(`${cleanedNumber}`).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * @deprecated Use `formatNumber` from `react-intl` instead.
 * Specify `style: "percent"` in the `options` parameter to format as a percentage.
 */
export function formatNumberAsPercent(num: number | string, decimals = 2) {
  return `${formatNumber(num, decimals)}%`;
}

/**
 * Checks if an amount is considered "dust" (negligible or close to zero).
 * @param amount - The amount to check
 * @param threshold - The threshold for dust amounts (default is 1e-10)
 * @returns true if the amount is considered dust
 */
export function isDustAmount(
  amount: number | string,
  threshold: number = 1e-10,
): boolean {
  const amountNumber = typeof amount === "string" ? Number(amount) : amount;

  return Math.abs(amountNumber) < threshold;
}

/**
 * Parses a string value into a JSBI BigInt
 * @param value - The string value to parse
 * @param decimals - The number of decimal places in the value
 * @returns The parsed JSBI BigInt
 * @deprecated Use native BigInt.
 */
export const parseToBigInt = (value: string, decimals: number): JSBI => {
  const [integerPart, fractionalPart = ""] = value.split(".");
  const fractionalPartPadded = fractionalPart
    .padEnd(decimals, "0")
    .slice(0, decimals);
  const wholeNumberString = `${integerPart}${fractionalPartPadded}`;
  return JSBI.BigInt(wholeNumberString);
};

/**
 * @deprecated Use `formatNumber` from `react-intl` instead.
 * Specify `minimumFractionDigits`/`maximumFractionDigits` in the `options` parameter to format decimal places.
 */
export function formatDecimalValues(value?: string, decimals?: number): string {
  const decimalVal = decimals === undefined ? 4 : decimals;
  return value ? parseFloat(value).toFixed(decimalVal) : "0";
}

const BILLION = "1000000000";
const MILLION = "1000000";
const THOUSAND = "1000";

export const FORMAT_ABBREVIATED_NUMBER_SUFFIX = {
  BILLION: "B",
  MILLION: "M",
  THOUSAND: "K",
};

/**
 * @param value A numeric string to format.
 * @returns The formatted numeric string and the suffix (K, M, B) to make large numbers more readable.
 */
export const formatAbbreviatedNumber = (
  value: string,
  {
    minimumFractionDigits,
  }: {
    minimumFractionDigits?: number;
  } = {},
) => {
  const big = new Big(value);
  const absolute = big.abs();

  if (absolute.gte(BILLION)) {
    return {
      value: big.div(BILLION).toFixed(minimumFractionDigits),
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.BILLION,
    };
  }

  if (absolute.gte(MILLION)) {
    return {
      value: big.div(MILLION).toFixed(minimumFractionDigits),
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.MILLION,
    };
  }

  if (absolute.gte(THOUSAND)) {
    return {
      value: big.div(THOUSAND).toFixed(minimumFractionDigits),
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.THOUSAND,
    };
  }

  return { value, suffix: "" };
};
