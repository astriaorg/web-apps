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

export const isZeroAddress = (address: string) => {
  return address === "0x0000000000000000000000000000000000000000";
};
