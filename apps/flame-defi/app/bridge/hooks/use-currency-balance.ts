import { useMemo } from "react";

import {
  GenericCurrency,
  IbcCurrency,
  EvmCurrency,
  PollingConfig,
  UseBalanceResult,
} from "@repo/flame-types";
import { useEvmCurrencyBalance } from "features/evm-wallet";
import { useIbcCurrencyBalance } from "features/cosmos-wallet";

/**
 * A hook that works with any currency type that implements GenericCurrency
 * and returns its balance, with support for polling
 *
 * This hook will detect if the currency is an IbcCurrency or EvmCurrency
 * and use the appropriate balance fetching mechanism
 *
 * @param currency The currency to fetch balance for
 * @param pollingConfig Optional configuration for polling (enabled, intervalMS)
 */
export function useCurrencyBalance(
  currency?: GenericCurrency,
  pollingConfig?: PollingConfig,
): UseBalanceResult {
  // Default polling config
  const defaultPollingConfig = useMemo(
    () => ({
      enabled: Boolean(currency),
      intervalMS: 10000, // 10 seconds by default
    }),
    [currency],
  );

  // Merge provided config with defaults
  const config = useMemo(
    () => ({
      ...defaultPollingConfig,
      ...pollingConfig,
    }),
    [defaultPollingConfig, pollingConfig],
  );

  const {
    balance: evmBalance,
    isLoading: isLoadingEvmBalance,
    error: evmError,
  } = useEvmCurrencyBalance(
    currency instanceof EvmCurrency ? currency : undefined,
    config,
  );

  const {
    balance: ibcBalance,
    isLoading: isLoadingIbcBalance,
    error: ibcError,
  } = useIbcCurrencyBalance(
    currency instanceof IbcCurrency ? currency : undefined,
    config,
  );

  // Combine results based on currency type
  const balance = currency instanceof EvmCurrency ? evmBalance : ibcBalance;
  const isLoading =
    currency instanceof EvmCurrency ? isLoadingEvmBalance : isLoadingIbcBalance;
  const error = currency instanceof EvmCurrency ? evmError : ibcError;

  return {
    balance,
    isLoading,
    error,
  };
}
