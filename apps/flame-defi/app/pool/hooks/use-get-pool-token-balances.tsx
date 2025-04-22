import { useAccount } from "wagmi";

import { EvmCurrency } from "@repo/flame-types";
import { useAstriaChainData } from "config";
import { useTokenBalance } from "features/evm-wallet";

// Use query for caching.
export const useGetPoolTokenBalances = (
  token0?: EvmCurrency,
  token1?: EvmCurrency,
) => {
  const userAccount = useAccount();
  const { chain } = useAstriaChainData();

  // TODO: Balances aren't cleared on disconnect wallet.

  const { balance: token0Balance, isLoading: isLoadingToken0Balance } =
    useTokenBalance(userAccount.address, chain, token0);

  const { balance: token1Balance, isLoading: isLoadingToken1Balance } =
    useTokenBalance(userAccount.address, chain, token1);

  return {
    token0Balance,
    token1Balance,
    isLoading: isLoadingToken0Balance || isLoadingToken1Balance,
  };
};
