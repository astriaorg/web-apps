import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance, useConfig } from "wagmi";

import { Balance, EvmCurrency } from "@repo/flame-types";

import { createErc20Service } from "../services/erc-20-service/erc-20-service";

interface PollingConfig {
  enabled: boolean;
  intervalMS: number;
}

/**
 * Custom hook to fetch and manage the token balance for a given token and user address.
 *
 * This hook internally handles fetching the token balance based on the provided token type (native or ERC20).
 * It provides the current balance value, loading state, error state, and a function to manually fetch the balance.
 * Also supports automatic polling with configurable interval.
 *
 * @param token The token to fetch balance for
 * @param pollingConfig Optional configuration for polling (enabled, intervalMS)
 */
export const useTokenBalance = (
  token?: EvmCurrency,
  pollingConfig?: PollingConfig,
) => {
  const wagmiConfig = useConfig();
  const { address: userAddress, chainId } = useAccount();
  const { data: nativeBalance } = useBalance({
    address: userAddress,
  });

  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Default polling config
  const defaultPollingConfig = {
    enabled: !!token && !!userAddress && !!chainId,
    intervalMS: 10000, // 10 seconds by default
  };

  // Merge provided config with defaults
  const config = {
    ...defaultPollingConfig,
    ...pollingConfig,
  };

  const fetchBalance = useCallback(async () => {
    if (!wagmiConfig || !chainId || !userAddress || !token) {
      return;
    }

    setIsLoading(true);

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

        const result = {
          value: balanceStr,
          symbol: token.coinDenom,
        };

        setBalance(result);
        setError(null);
        return result;
      } else {
        // For native tokens
        if (!nativeBalance?.value) {
          setBalance(null);
          return;
        }

        const balanceStr = formatUnits(
          nativeBalance.value,
          nativeBalance.decimals,
        );

        const result = {
          value: balanceStr,
          symbol: token.coinDenom,
        };

        setBalance(result);
        setError(null);
        return result;
      }
    } catch (e) {
      const errorObj =
        e instanceof Error ? e : new Error("Failed to fetch balance.");
      setError(errorObj);
      console.error("Failed to fetch token balance", errorObj);
      return;
    } finally {
      setIsLoading(false);
    }
  }, [wagmiConfig, chainId, userAddress, token, nativeBalance]);

  // Fetch balance when parameters change
  useEffect(() => {
    if (userAddress && chainId && token) {
      void fetchBalance();
    }
  }, [userAddress, chainId, token, fetchBalance]);

  // Setup polling if enabled
  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    const intervalId = setInterval(fetchBalance, config.intervalMS);

    return () => clearInterval(intervalId);
  }, [fetchBalance, config.enabled, config.intervalMS]);

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
  };
};
