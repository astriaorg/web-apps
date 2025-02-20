import { EvmCurrency, EvmChainInfo } from "@repo/flame-types";
import { createWithdrawerService } from "features/EvmWallet";
import type { AstriaErc20WithdrawerService } from "features/EvmWallet/services/AstriaWithdrawerService/AstriaWithdrawerService";
import { useCallback, useState } from "react";
import { formatBalance } from "@repo/ui/utils";
import { formatUnits } from "viem";
import { useConfig, useBalance } from "wagmi";

export const useTokenBalances = (
  userAddress: `0x${string}` | undefined,
  evmChain: EvmChainInfo | undefined,
) => {
  const wagmiConfig = useConfig();
  const [balances, setBalances] = useState<{ symbol: string; value: string }[] | []>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {data: nativeBalance} = useBalance({
    address: userAddress as `0x${string}`,
  });

  const fetchBalances = useCallback(async (selectedTokens: (EvmCurrency | null | undefined)[]) => {
    if (!wagmiConfig || !evmChain || !userAddress || selectedTokens.length === 0) {
      return [];
    }
    setIsLoading(true);

    const updateBalance = (value: string, symbol: string, index: number) => {
      setBalances((prev) => {
        const newBalances = [...prev];
        newBalances[index] = { value, symbol };
        return newBalances;
      });
    };

    try {
      selectedTokens.filter((data) => data !== null).map(async (selectedToken, index) => {
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

          const balanceStr = formatBalance(
            balanceRes.toString(),
            selectedToken.coinDecimals,
          );
          updateBalance(balanceStr.toString() || "0", selectedToken.coinDenom, index);
        } else if (
          selectedToken.nativeTokenWithdrawerContractAddress
          && nativeBalance?.value
        ) {
          const formattedBalance = formatUnits(
            nativeBalance.value,
            nativeBalance.decimals,
          );

          updateBalance(formattedBalance || "0", selectedToken.coinDenom, index);
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
  }, [wagmiConfig, evmChain, userAddress, nativeBalance]);


  return {
    balances,
    isLoading,
    error,
    fetchBalances,
  };
}; 