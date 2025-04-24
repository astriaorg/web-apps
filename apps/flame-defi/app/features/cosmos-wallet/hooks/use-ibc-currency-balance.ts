import { useQuery } from "@tanstack/react-query";
import { Decimal } from "@cosmjs/math";

import {
  Balance,
  IbcCurrency,
  PollingConfig,
  UseBalanceResult,
} from "@repo/flame-types";
import { useConfig } from "config";

import { getBalanceFromChain } from "../services/cosmos";
import { useCosmosWallet } from "./use-cosmos-wallet";

/**
 * Custom hook to fetch and manage the balance for an IBC currency.
 *
 * This hook internally handles fetching the IBC token balance for a specific address.
 * It provides the current balance value, loading state, and error state.
 * Also supports automatic polling with configurable interval.
 *
 * @param currency The IBC currency to fetch balance for
 * @param pollingConfig Optional configuration for polling (enabled, intervalMS)
 */
export const useIbcCurrencyBalance = (
  currency?: IbcCurrency,
  pollingConfig?: PollingConfig,
): UseBalanceResult => {
  const { selectedCosmosChain, cosmosAccountAddress } = useCosmosWallet();
  const { cosmosChains } = useConfig();

  // use first cosmos chain if none selected yet
  const chain = selectedCosmosChain || Object.values(cosmosChains)[0];

  const intervalMS = pollingConfig?.intervalMS ?? 10000; // 10 seconds by default
  const enabled = pollingConfig?.enabled ?? true;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "ibcBalance",
      chain?.chainId,
      cosmosAccountAddress,
      currency?.coinMinimalDenom,
    ],
    queryFn: async (): Promise<Balance | null> => {
      if (!chain || !cosmosAccountAddress || !currency) {
        return null;
      }

      try {
        const balanceAmount = await getBalanceFromChain(
          chain,
          currency,
          cosmosAccountAddress,
        );

        const amount = Decimal.fromAtomics(
          balanceAmount,
          currency.coinDecimals,
        );

        return {
          value: amount.toString(),
          symbol: currency.coinDenom,
        };
      } catch (e) {
        const errorObj =
          e instanceof Error ? e : new Error("Failed to fetch IBC balance.");
        console.error("Failed to fetch IBC balance", errorObj);
        throw errorObj;
      }
    },
    enabled: !!currency && !!cosmosAccountAddress && !!chain && enabled,
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
