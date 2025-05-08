import { Decimal } from "@cosmjs/math";
import { useQuery } from "@tanstack/react-query";

import { Balance, IbcCurrency } from "@repo/flame-types";
import { useConfig } from "config";
import { useCosmosWallet } from "features/cosmos-wallet/hooks/use-cosmos-wallet";
import { getBalanceFromChain } from "features/cosmos-wallet/services/cosmos";
import { PollingConfig, UseBalanceResult } from "hooks/use-currency-balance";

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

  // user may not have selected a chain from the ui,
  // but we want to get balance for the default chain
  const chain = selectedCosmosChain || Object.values(cosmosChains)[0];

  const intervalMS = pollingConfig?.intervalMS ?? 10000; // 10 seconds by default

  const enabled = (() => {
    // chain id must match currency id
    if (chain?.chainId !== currency?.chainId) {
      return false;
    }
    const enabledFromConfig = pollingConfig?.enabled ?? true; // true if pollingConfig undefined
    return (
      enabledFromConfig &&
      Boolean(chain) &&
      Boolean(currency) &&
      Boolean(cosmosAccountAddress)
    );
  })();

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

      const balanceAmount = await getBalanceFromChain(
        chain,
        currency,
        cosmosAccountAddress,
      );

      const amount = Decimal.fromAtomics(balanceAmount, currency.coinDecimals);

      return {
        value: amount.toString(),
        symbol: currency.coinDenom,
      };
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
