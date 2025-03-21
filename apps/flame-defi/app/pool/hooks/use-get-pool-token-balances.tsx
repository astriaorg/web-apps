import { useTokenBalances } from "features/evm-wallet";
import { usePoolPositionContext } from "./use-pool-position-context";
import { useAccount } from "wagmi";
import { useEvmChainData } from "config";
import { useEffect } from "react";

export const useGetPoolTokenBalances = () => {
  const userAccount = useAccount();
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;
  const { poolTokenOne, poolTokenTwo } = usePoolPositionContext();

  const tokenOneBalance = currencies.find(
    (currency) =>
      currency.coinDenom.toLowerCase() === poolTokenOne.symbol.toLowerCase(),
  );
  const tokenTwoBalance = currencies.find(
    (currency) =>
      currency.coinDenom.toLowerCase() === poolTokenTwo.symbol.toLowerCase(),
  );

  const { balances, fetchBalances } = useTokenBalances(
    userAccount.address,
    selectedChain,
  );

  useEffect(() => {
    fetchBalances([tokenOneBalance, tokenTwoBalance]);
  }, [tokenOneBalance, tokenTwoBalance, fetchBalances]);

  return { balances, tokenOneBalance, tokenTwoBalance };
};
