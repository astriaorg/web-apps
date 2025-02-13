import JSBI from "jsbi";
import { defaultSlippageTolerance } from "../constants";

export function getFromLocalStorage(item: string) {
  const retrievedItem = window.localStorage.getItem(item);

  if (retrievedItem) {
    return JSON.parse(retrievedItem);
  }
  return {};
}

export function setInLocalStorage(key: string, item: unknown) {
  window.localStorage.setItem(key, JSON.stringify(item));
}

export function getSlippageTolerance() {
  const settings = getFromLocalStorage("settings");
  return settings?.slippageTolerance || defaultSlippageTolerance;
}

/**
 * Formats a raw balance amount into a human-readable decimal number with 2 decimal places.
 * Converts from the smallest unit (e.g. wei, satoshi) to the standard unit (e.g. ETH, BTC)
 * by dividing by the appropriate power of 10 based on the `decimals` parameter.
 *
 * @param rawBalance - The raw balance amount as a string, represented in the smallest unit
 * @param [decimals=18] - Number of decimal places to shift by (defaults to 18 for ETH compatibility)
 */
export function formatBalance(rawBalance: string, decimals = 18): string {
  const denom = 10 ** decimals;
  return `${Number.parseInt(rawBalance) / denom}`;
}

/**
 * Shortens an address by showing only the first and last few characters with
 * ellipsis in middle.
 */
export function shortenAddress(
  address: string,
  startLength = 6,
  endLength = 4,
): string {
  if (!address) {
    return "";
  }

  // if the address is shorter than or equal to start + end length, return it as is
  if (address.length <= startLength + endLength) {
    return address;
  }

  // only shorten the string if input length is greater than 0
  const start = startLength > 0 ? address.slice(0, startLength) : "";
  const end = endLength > 0 ? address.slice(-endLength) : "";

  return `${start}...${end}`;
}

export function formatDecimalValues(value?: string, decimals?: number): string {
  const decimalVal = decimals === undefined ? 4 : decimals;
  return value ? parseFloat(value).toFixed(decimalVal) : "0";
}

/**
 * Checks if an amount is dust (close to zero)
 * @param amount - The amount to check
 * @param threshold - The threshold for dust amounts (default is 1e-10)
 * @returns true if the amount is dust (aka negligible) and we want to ignore it
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
