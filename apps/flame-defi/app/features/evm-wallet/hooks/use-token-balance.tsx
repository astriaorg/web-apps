import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";
import { useAccount, useBalance, useConfig } from "wagmi";

import {
  Balance,
  EvmCurrency,
  PollingConfig,
  UseBalanceResult,
} from "@repo/flame-types";

import { createErc20Service } from "../services/erc-20-service/erc-20-service";

/**
 * Custom hook to fetch and manage the token balance for a given token and user address.
 *
 * This hook internally handles fetching the token balance based on the provided token type (native or ERC20).
 * It provides the current balance value, loading state, and error state.
 * Also supports automatic polling with configurable interval.
 *
 * @param token The token to fetch balance for
 * @param pollingConfig Optional configuration for polling (enabled, intervalMS)
 */
export const useTokenBalance = (
  token?: EvmCurrency,
  pollingConfig?: PollingConfig,
): UseBalanceResult => {
  const wagmiConfig = useConfig();
  const { address: userAddress, chainId } = useAccount();
  const { data: nativeBalance } = useBalance({
    address: userAddress,
  });

  const intervalMS = pollingConfig?.intervalMS ?? 10000; // 10 seconds by default
  const enabled = pollingConfig?.enabled ?? true;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "tokenBalance",
      userAddress,
      chainId,
      token?.coinDenom,
      token?.erc20ContractAddress,
    ],
    queryFn: async (): Promise<Balance | null> => {
      if (!wagmiConfig || !chainId || !userAddress || !token) {
        return null;
      }

      try {
        if (token.erc20ContractAddress) {
          // For ERC20 tokens
          const erc20Service = createErc20Service(
            wagmiConfig,
            token.erc20ContractAddress,
          );

          const balanceRes = await erc20Service.getBalance(
            chainId,
            userAddress as string,
          );

          const balanceStr = formatUnits(balanceRes, token.coinDecimals);

          return {
            value: balanceStr,
            symbol: token.coinDenom,
          };
        } else {
          // For native tokens
          if (!nativeBalance?.value) {
            return null;
          }

          const balanceStr = formatUnits(
            nativeBalance.value,
            nativeBalance.decimals,
          );

          return {
            value: balanceStr,
            symbol: token.coinDenom,
          };
        }
      } catch (e) {
        const errorObj =
          e instanceof Error ? e : new Error("Failed to fetch balance.");
        console.error("Failed to fetch token balance", errorObj);
        throw errorObj;
      }
    },
    enabled: !!token && !!userAddress && !!chainId && enabled,
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
