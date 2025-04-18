import Big from "big.js";

/**
 * Use `removeNonNumeric` to remove non-numeric characters from a string that you desire to be all numbers or decimals.
 */
export const removeNonNumeric = (str: string) => str.replace(/[^0-9.]/g, "");

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

type Threshold = "thousand" | "million" | "billion";
const DEFAULT_THRESHOLD: Threshold = "thousand";
const THRESHOLD_TO_NUMBER_MAP = {
  thousand: THOUSAND,
  million: MILLION,
  billion: BILLION,
};

export type FormatAbbreviatedNumberOptions = {
  /**
   * The threshold for when to start abbreviating the number.
   *
   * If not provided, the number will always be abbreviated.
   */
  threshold?: Threshold;
};

/**
 * @param value A numeric string to format.
 * @returns The formatted numeric string and the suffix (K, M, B) to make large numbers more readable.
 */
export const formatAbbreviatedNumber = (
  value: string,
  { threshold = DEFAULT_THRESHOLD }: FormatAbbreviatedNumberOptions = {
    threshold: DEFAULT_THRESHOLD,
  },
) => {
  const big = new Big(value);
  const absolute = big.abs();

  if (
    absolute.gte(BILLION) &&
    absolute.gt(THRESHOLD_TO_NUMBER_MAP[threshold])
  ) {
    return {
      value: big.div(BILLION).toFixed(),
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.BILLION,
    };
  }

  if (
    absolute.gte(MILLION) &&
    absolute.gt(THRESHOLD_TO_NUMBER_MAP[threshold])
  ) {
    return {
      value: big.div(MILLION).toFixed(),
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.MILLION,
    };
  }

  if (
    absolute.gte(THOUSAND) &&
    absolute.gt(THRESHOLD_TO_NUMBER_MAP[threshold])
  ) {
    return {
      value: big.div(THOUSAND).toFixed(),
      suffix: FORMAT_ABBREVIATED_NUMBER_SUFFIX.THOUSAND,
    };
  }

  return {
    value: big.toFixed(),
    suffix: "",
  };
};
