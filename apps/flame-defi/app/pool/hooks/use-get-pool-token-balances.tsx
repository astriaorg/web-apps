import { useTokenBalances } from "features/evm-wallet";
import { useAccount } from "wagmi";
import { useAstriaChainData } from "config";
import { useEffect } from "react";

export const useGetPoolTokenBalances = (
  poolTokenOneSymbol: string,
  poolTokenTwoSymbol: string,
) => {
  const userAccount = useAccount();
  const { selectedChain } = useAstriaChainData();
  const { currencies } = selectedChain;

  const tokenOne =
    currencies.find(
      (currency) =>
        currency.coinDenom.toLowerCase() === poolTokenOneSymbol.toLowerCase(),
    ) || null;
  const tokenTwo =
    currencies.find(
      (currency) =>
        currency.coinDenom.toLowerCase() === poolTokenTwoSymbol.toLowerCase(),
    ) || null;

  const { balances, fetchBalances } = useTokenBalances(
    userAccount.address,
    selectedChain,
  );

  useEffect(() => {
    fetchBalances([tokenOne, tokenTwo]);
  }, [tokenOne, tokenTwo, fetchBalances]);

  const tokenOneBalance =
    balances.find((balance) => balance.symbol === tokenOne?.coinDenom) || null;

  const tokenTwoBalance =
    balances.find((balance) => balance.symbol === tokenTwo?.coinDenom) || null;

  return { balances, tokenOne, tokenTwo, tokenOneBalance, tokenTwoBalance };
};
