import { useAccount } from "wagmi";

import { Balance } from "@repo/flame-types";
import { useAstriaChainData } from "config";
import { useTokenBalance } from "features/evm-wallet";

// TODO: Refactor, use address instead of symbol when fetching balances.
// Use query for caching.
export const useGetPoolTokenBalances = (
  poolToken0Symbol?: string,
  poolToken1Symbol?: string,
) => {
  const userAccount = useAccount();
  const { chain } = useAstriaChainData();
  const { currencies } = chain;

  const token0 = currencies.find(
    (currency) =>
      currency.coinDenom.toLowerCase() === poolToken0Symbol?.toLowerCase(),
  );
  const token1 = currencies.find(
    (currency) =>
      currency.coinDenom.toLowerCase() === poolToken1Symbol?.toLowerCase(),
  );

  // TODO: Balances aren't cleared on disconnect wallet.

  // Get token0 balance
  const { balance: token0Balance, isLoading: isLoadingToken0Balance } =
    useTokenBalance(userAccount.address, chain, token0);

  // Get token1 balance
  const { balance: token1Balance, isLoading: isLoadingToken1Balance } =
    useTokenBalance(userAccount.address, chain, token1);

  // Collection of balances to maintain API compatibility
  const balances = [token0Balance, token1Balance].filter(Boolean) as Balance[];

  return {
    balances,
    token0,
    token1,
    token0Balance,
    token1Balance,
    isLoading: isLoadingToken0Balance || isLoadingToken1Balance,
  };
};
