import type { EvmCurrency } from "@repo/flame-types";

export const filterPoolTokens = (
  currencies: EvmCurrency[],
  token?: EvmCurrency,
) => {
  return currencies.filter((currency) => {
    if (!token) {
      // No token selected, show all currencies.
      return true;
    }
    if (token.isNative) {
      // If the selected token is native, exclude the wrapped native.
      return (
        !currency.isWrappedNative &&
        currency.erc20ContractAddress !== token.erc20ContractAddress
      );
    }
    if (token.isWrappedNative) {
      // If the selected token is wrapped native, exclude the native.
      return (
        !currency.isNative &&
        currency.erc20ContractAddress !== token.erc20ContractAddress
      );
    }
    // Exclude the currently selected token.
    return currency.erc20ContractAddress !== token.erc20ContractAddress;
  });
};
