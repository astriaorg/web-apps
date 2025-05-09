import type { EvmCurrency } from "@repo/flame-types";

/**
 * Filter token options for opposite list based on selected token
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
