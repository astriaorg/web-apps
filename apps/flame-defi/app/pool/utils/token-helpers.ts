import type { AstriaChain, EvmCurrency } from "@repo/flame-types";

/**
 * Gets a token by its address.
 *
 * This check is required because the address returned from the contract is the wrapped native token, but we want to display the native token.
 *
 * @returns The token that matches the address, or null if not found. For wrapped native tokens, the native token is returned.
 */
export const getTokenFromAddress = (
  address: string,
  chain: AstriaChain,
): EvmCurrency | null => {
  if (address === chain.contracts.wrappedNativeToken.address) {
    return chain.currencies.find((currency) => currency.isNative) || null;
  }

  return (
    chain.currencies.find(
      (currency) => currency.erc20ContractAddress === address,
    ) || null
  );
};

/**
 * Filter token options for opposite list based on selected token.
 */
export const filterPoolTokens = (
  tokens: EvmCurrency[],
  selectedToken?: EvmCurrency,
) => {
  return tokens.filter((token) => {
    if (!selectedToken) {
      // No token selected, show all tokens.
      return true;
    }
    if (selectedToken.isNative) {
      // If the selected token is native, exclude the wrapped native.
      return (
        !token.isWrappedNative &&
        token.erc20ContractAddress !== selectedToken.erc20ContractAddress
      );
    }
    if (selectedToken.isWrappedNative) {
      // If the selected token is wrapped native, exclude the native.
      return (
        !token.isNative &&
        token.erc20ContractAddress !== selectedToken.erc20ContractAddress
      );
    }
    // Exclude the currently selected token.
    return token.erc20ContractAddress !== selectedToken.erc20ContractAddress;
  });
};
