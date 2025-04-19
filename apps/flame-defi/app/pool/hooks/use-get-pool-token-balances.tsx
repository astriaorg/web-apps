import { useEvmChainData } from "config";
import { useTokenBalances } from "features/evm-wallet";
import { useCallback, useEffect } from "react";
import { useAccount } from "wagmi";

// TODO: Refactor, use address instead of symbol when fetching balances.
// Use query for caching.
export const useGetPoolTokenBalances = (
  poolToken0Symbol?: string,
  poolToken1Symbol?: string,
) => {
  const userAccount = useAccount();
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;

  // TODO: Don't need to return the tokens since the function caller already has this info when passing in the symbols.
  // I think this is a hack to handle the network selector returning currency data for mainnet on first render.
  const token0 =
    currencies.find(
      (currency) =>
        currency.coinDenom.toLowerCase() === poolToken0Symbol?.toLowerCase(),
    ) || null;
  const token1 =
    currencies.find(
      (currency) =>
        currency.coinDenom.toLowerCase() === poolToken1Symbol?.toLowerCase(),
    ) || null;

  // TODO: Balances aren't cleared on disconnect wallet.
  const { balances, fetchBalances } = useTokenBalances(
    userAccount.address,
    selectedChain,
  );

  useEffect(() => {
    fetchBalances([token0, token1]);
  }, [token0, token1, fetchBalances]);

  const refreshBalances = useCallback(() => {
    if (token0 && token1) {
      return fetchBalances([token0, token1]);
    }
  }, [token0, token1, fetchBalances]);

  const token0Balance =
    balances.find(
      (balance) => balance && balance.symbol === token0?.coinDenom,
    ) || null;

  const token1Balance =
    balances.find(
      (balance) => balance && balance.symbol === token1?.coinDenom,
    ) || null;

  return {
    balances,
    token0,
    token1,
    token0Balance,
    token1Balance,
    refreshBalances,
  };
};
