import { useTokenBalances } from "features/evm-wallet";
import { useAccount } from "wagmi";
import { useEvmChainData } from "config";
import { useEffect, useCallback } from "react";

export const useGetPoolTokenBalances = (
  poolToken0Symbol: string,
  poolToken1Symbol: string,
) => {
  const userAccount = useAccount();
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;

  const tokenOne =
    currencies.find(
      (currency) =>
        currency.coinDenom.toLowerCase() === poolToken0Symbol.toLowerCase(),
    ) || null;
  const tokenTwo =
    currencies.find(
      (currency) =>
        currency.coinDenom.toLowerCase() === poolToken1Symbol.toLowerCase(),
    ) || null;

  const { balances, fetchBalances } = useTokenBalances(
    userAccount.address,
    selectedChain,
  );

  useEffect(() => {
    fetchBalances([tokenOne, tokenTwo]);
  }, [tokenOne, tokenTwo, fetchBalances]);

  const refreshBalances = useCallback(() => {
    if (tokenOne && tokenTwo) {
      return fetchBalances([tokenOne, tokenTwo]);
    }
  }, [tokenOne, tokenTwo, fetchBalances]);

  const tokenOneBalance =
    balances.find(
      (balance) => balance && balance.symbol === tokenOne?.coinDenom,
    ) || null;

  const tokenTwoBalance =
    balances.find(
      (balance) => balance && balance.symbol === tokenTwo?.coinDenom,
    ) || null;

  return {
    balances,
    tokenOne,
    tokenTwo,
    tokenOneBalance,
    tokenTwoBalance,
    refreshBalances,
  };
};
