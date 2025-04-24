import { useCallback, useEffect, useMemo, useState } from "react";
import { Decimal } from "@cosmjs/math";

import { Balance, IbcCurrency } from "@repo/flame-types";
import { useConfig } from "config";

import { getBalanceFromChain } from "../services/cosmos";
import { useCosmosWallet } from "./use-cosmos-wallet";

interface PollingConfig {
  enabled: boolean;
  intervalMS: number;
}

/**
 * Custom hook to fetch and manage the balance for an IBC currency.
 *
 * This hook internally handles fetching the IBC token balance for a specific address.
 * It provides the current balance value, loading state, error state, and a function to manually fetch the balance.
 * Also supports automatic polling with configurable interval.
 *
 * @param currency The IBC currency to fetch balance for
 * @param pollingConfig Optional configuration for polling (enabled, intervalMS)
 */
export const useIbcCurrencyBalance = (
  currency?: IbcCurrency,
  pollingConfig?: PollingConfig,
) => {
  const { selectedCosmosChain, cosmosAccountAddress } = useCosmosWallet();
  const { cosmosChains } = useConfig();

  // use first cosmos chain if none selected yet
  const chain = useMemo(() => {
    if (!selectedCosmosChain) {
      return Object.values(cosmosChains)[0];
    }
    return selectedCosmosChain;
  }, [cosmosChains, selectedCosmosChain]);

  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Default polling config
  const defaultPollingConfig = {
    enabled: !!currency && !!cosmosAccountAddress && !!chain,
    intervalMS: 10000, // 10 seconds by default
  };

  // Merge provided config with defaults
  const config = {
    ...defaultPollingConfig,
    ...pollingConfig,
  };

  const fetchBalance = useCallback(async () => {
    if (!chain || !cosmosAccountAddress || !currency) {
      return;
    }

    setIsLoading(true);

    try {
      const balanceAmount = await getBalanceFromChain(
        chain,
        currency,
        cosmosAccountAddress,
      );

      const amount = Decimal.fromAtomics(balanceAmount, currency.coinDecimals);

      const result = {
        value: amount.toString(),
        symbol: currency.coinDenom,
      };

      setBalance(result);
      setError(null);
      return result;
    } catch (e) {
      const errorObj =
        e instanceof Error ? e : new Error("Failed to fetch IBC balance.");
      setError(errorObj);
      console.error("Failed to fetch IBC balance", errorObj);
      return;
    } finally {
      setIsLoading(false);
    }
  }, [chain, cosmosAccountAddress, currency]);

  // Fetch balance when parameters change
  useEffect(() => {
    if (chain && cosmosAccountAddress && currency) {
      void fetchBalance();
    }
  }, [chain, cosmosAccountAddress, currency, fetchBalance]);

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
  };
};
