import { EvmCurrency } from "@repo/flame-types";
import { useTokenBalance } from "features/evm-wallet";

// Use query for caching.
export const useGetPoolTokenBalances = (
  token0?: EvmCurrency,
  token1?: EvmCurrency,
) => {
  // TODO: Balances aren't cleared on disconnect wallet.

  const { balance: token0Balance, isLoading: isLoadingToken0Balance } =
    useTokenBalance(token0);

  const { balance: token1Balance, isLoading: isLoadingToken1Balance } =
    useTokenBalance(token1);

  return {
    token0Balance,
    token1Balance,
    isLoading: isLoadingToken0Balance || isLoadingToken1Balance,
  };
};
