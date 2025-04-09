import { useTokenBalances } from "features/evm-wallet";
import { useAccount } from "wagmi";
import { useAstriaChainData } from "config";
import { useEffect, useCallback } from "react";

export const useGetPoolTokenBalances = (
  poolToken0Symbol: string,
  poolToken1Symbol: string,
) => {
  const userAccount = useAccount();
  const { selectedChain } = useAstriaChainData();
  const { currencies } = selectedChain;

  const token0 =
    currencies.find(
      (currency) =>
        currency.coinDenom.toLowerCase() === poolToken0Symbol.toLowerCase(),
    ) || null;
  const token1 =
    currencies.find(
      (currency) =>
        currency.coinDenom.toLowerCase() === poolToken1Symbol.toLowerCase(),
    ) || null;

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
