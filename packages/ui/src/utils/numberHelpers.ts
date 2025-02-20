import JSBI from "jsbi";
const allCommas = /,/g;

/**
 * Formats a number to a string with a specified number of decimal places and adds commas as thousand separators.
 * @param num - The number or string to format
 * @param decimals - The number of decimal places to include (default is 4)
 * @returns The formatted number as a string
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
 * Formats a number as a percentage string.
 * @param num - The number or string to format
 * @param decimals - The number of decimal places to include (default is 2)
 * @returns The formatted percentage string
 */
export function formatNumberAsPercent(num: number | string, decimals = 2) {
  return `${formatNumber(num, decimals)}%`;
}

interface NumberAsAbbrOptions {
  hideSymbol?: boolean;
  removeKAbbr?: boolean;
  decimalPlaces?: number;
}

/**
 * Formats a number into an abbreviated string with a suffix (e.g., k, m, b) and optional currency symbol.
 * @param num - The number to format
 * @param opts - Options to hide currency symbol or remove 'k' abbreviation and set decimal places
 * @param locale - The locale to use for formatting (default is "en-US")
 * @returns The formatted abbreviated string
 */
export function formatNumberAsAbbr(
  value: number | string,
  opts: NumberAsAbbrOptions = {},
  locale = "en-US",
) {
  let num = typeof value === "string" ? Number(value) : value;
  let suffix = "";

  if (Math.abs(num) < 1_000) {
    suffix = "";
  } else if (Math.abs(num) < 1_000_000) {
    if (opts.removeKAbbr) {
      return num;
    } else {
      suffix = "K";
      num = num / 1_000;
    }
  } else if (Math.abs(num) < 1_000_000_000) {
    suffix = "M";
    num = num / 1_000_000;
  } else if (Math.abs(num) < 1_000_000_000_000) {
    suffix = "B";
    num = num / 1_000_000_000;
  }

  // In the future we can extend this to use any currency symbol
  const symbol = opts.hideSymbol ? "" : "$";

  if (opts.decimalPlaces === undefined) {
    // Use 2 decimals for fiat and 4 for non fiat
    opts.decimalPlaces = symbol ? 2 : 4;
  }

  const localeString = num.toLocaleString(locale, {
    minimumFractionDigits: opts.decimalPlaces,
    maximumFractionDigits: opts.decimalPlaces,
  });

  // If the return string is -0.00 or some variant, strip the negative
  if (localeString.match(/-0\.?[0]*$/)) {
    return localeString.replace("-", "");
  }

  return `${symbol}${localeString}${suffix}`;
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
 */
export const parseToBigInt = (value: string, decimals: number): JSBI => {
  const [integerPart, fractionalPart = ""] = value.split(".");
  const fractionalPartPadded = fractionalPart
    .padEnd(decimals, "0")
    .slice(0, decimals);
  const wholeNumberString = `${integerPart}${fractionalPartPadded}`;
  return JSBI.BigInt(wholeNumberString);
};

export function formatDecimalValues(value?: string, decimals?: number): string {
  const decimalVal = decimals === undefined ? 4 : decimals;
  return value ? parseFloat(value).toFixed(decimalVal) : "0";
}
