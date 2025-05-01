import { useQuery } from "@tanstack/react-query";
import { getBalance } from "@wagmi/core";
import { formatUnits } from "viem";
import { useAccount, useConfig } from "wagmi";

import { Balance, EvmCurrency } from "@repo/flame-types";
import type { PollingConfig, UseBalanceResult } from "hooks/use-currency-balance";

import { createErc20Service } from "../services/erc-20-service";

/**
 * Custom hook to fetch and manage the token balance for a given token and user address.
 *
 * This hook internally handles fetching the token balance based on the provided token type (native or ERC20).
 * It provides the current balance value, loading state, and error state.
 * Also supports automatic polling with configurable interval.
 *
 * @param currency The currency to fetch balance for
 * @param pollingConfig Optional configuration for polling (enabled, intervalMS)
 */
export const useEvmCurrencyBalance = (
  currency?: EvmCurrency,
  pollingConfig?: PollingConfig,
): UseBalanceResult => {
  const wagmiConfig = useConfig();
  const { address: userAddress, chainId } = useAccount();

  const intervalMS = pollingConfig?.intervalMS ?? 10000; // 10 seconds by default

  const enabled = (() => {
    // chain id must match currency id
    if (chainId !== currency?.chainId) {
      return false;
    }
    const enabledFromConfig = pollingConfig?.enabled ?? true; // true if pollingConfig undefined
    return (
      enabledFromConfig &&
      Boolean(chainId) &&
      Boolean(currency) &&
      Boolean(userAddress)
    );
  })();

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "tokenBalance",
      userAddress,
      chainId,
      currency?.coinDenom,
      currency?.erc20ContractAddress,
    ],
    queryFn: async (): Promise<Balance | null> => {
      if (!wagmiConfig || !chainId || !userAddress || !currency) {
        return null;
      }

      if (currency.erc20ContractAddress) {
        // For ERC20 tokens
        const erc20Service = createErc20Service(
          wagmiConfig,
          currency.erc20ContractAddress,
        );

        const balanceRes = await erc20Service.getBalance(
          chainId,
          userAddress as string,
        );

        const balanceStr = formatUnits(balanceRes, currency.coinDecimals);

        return {
          value: balanceStr,
          symbol: currency.coinDenom,
        };
      } else {
        // Fetch native token balance inside the query so loading state is synchronized.
        const nativeBalance = await getBalance(wagmiConfig, {
          address: userAddress,
          chainId,
        });

        if (!nativeBalance.value) {
          return null;
        }

        const balanceStr = formatUnits(
          nativeBalance.value,
          nativeBalance.decimals,
        );

        return {
          value: balanceStr,
          symbol: currency.coinDenom,
        };
      }
    },
    enabled: enabled,
    refetchInterval: intervalMS,
    staleTime: Math.min(intervalMS / 2, 5000),
    retry: 2,
  });

  return {
    balance: data ?? null,
    isLoading,
    error,
  };
};
