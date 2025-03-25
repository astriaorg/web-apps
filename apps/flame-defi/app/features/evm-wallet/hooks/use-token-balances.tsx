import { EvmCurrency, EvmChainInfo, HexString } from "@repo/flame-types";
import { createWithdrawerService } from "features/evm-wallet";
import type { AstriaErc20WithdrawerService } from "features/evm-wallet/services/astria-withdrawer-service/astria-withdrawer-service";
import { useCallback, useState } from "react";
import { formatUnits } from "viem";
import { useConfig, useBalance } from "wagmi";

export const useTokenBalances = (
  userAddress: HexString | undefined,
  evmChain: EvmChainInfo | undefined,
) => {
  const wagmiConfig = useConfig();
  const [balances, setBalances] = useState<
    { symbol: string; value: string }[] | []
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: nativeBalance } = useBalance({
    address: userAddress as HexString,
  });

  const updateBalance = (value: string, symbol: string, index: number) => {
    setBalances((prev) => {
      const newBalances = [...prev];
      newBalances[index] = { value, symbol };
      return newBalances;
    });
  };

  const fetchBalances = useCallback(
    async (selectedTokens: (EvmCurrency | null | undefined)[]) => {
      if (
        !wagmiConfig ||
        !evmChain ||
        !userAddress ||
        selectedTokens.length === 0
      ) {
        return [];
      }
      setIsLoading(true);

      try {
        selectedTokens.map(async (selectedToken, index) => {
          if (!selectedToken) return null;

          if (selectedToken.erc20ContractAddress) {
            const withdrawerSvc = createWithdrawerService(
              wagmiConfig,
              selectedToken.erc20ContractAddress,
              true,
            ) as AstriaErc20WithdrawerService;

            const balanceRes = await withdrawerSvc.getBalance(
              evmChain.chainId,
              userAddress as string,
            );

            const balanceStr = formatUnits(
              balanceRes,
              selectedToken.coinDecimals,
            );
            updateBalance(balanceStr, selectedToken.coinDenom, index);
          } else {
            // this is the native token
            let balance = "0";
            if (nativeBalance) {
              balance = formatUnits(
                nativeBalance.value,
                nativeBalance.decimals,
              );
            }
            updateBalance(balance, selectedToken.coinDenom, index);
          }
        });
        setError(null);
      } catch (e) {
        const error =
          e instanceof Error ? e : new Error("Failed to fetch balances");
        setError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [wagmiConfig, evmChain, userAddress, nativeBalance],
  );

  return {
    balances,
    isLoading,
    error,
    fetchBalances,
  };
};
