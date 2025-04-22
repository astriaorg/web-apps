"use client";

import { useCallback, useMemo } from "react";
import {
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";
import { DropdownOption } from "components/dropdown";
import { useConfig } from "config";

export interface WithdrawOptions {
  // Chain options
  sourceChainOptions: DropdownOption<CosmosChainInfo | EvmChainInfo>[];
  destinationChainOptions: DropdownOption<CosmosChainInfo | EvmChainInfo>[];

  // Currency options
  getSourceCurrencyOptions: (
    chain: CosmosChainInfo | EvmChainInfo | null,
  ) => DropdownOption<EvmCurrency | IbcCurrency>[];
  getDestinationCurrencyOptions: (
    chain: CosmosChainInfo | EvmChainInfo | null,
  ) => DropdownOption<EvmCurrency | IbcCurrency>[];

  // Find matching currency
  findMatchingDestinationCurrency: (
    sourceChain: CosmosChainInfo | EvmChainInfo | null,
    sourceCurrency: EvmCurrency | IbcCurrency | null,
    destinationChain: CosmosChainInfo | EvmChainInfo | null,
  ) => DropdownOption<EvmCurrency | IbcCurrency> | null;
}

export function useWithdrawOptions(): WithdrawOptions {
  const { astriaChains, coinbaseChains, cosmosChains } = useConfig();

  // Chain options
  const sourceChainOptions = useMemo(() => {
    return Object.values(astriaChains).map((c) => ({
      label: c.chainName,
      value: c,
      LeftIcon: c.IconComponent,
    }));
  }, [astriaChains]);

  const destinationChainOptions = useMemo(() => {
    const cosmosChainsOptions = Object.values(cosmosChains).map((c) => ({
      label: c.chainName,
      value: c,
      LeftIcon: c.IconComponent,
    }));

    // Coinbase/Base chains
    const evmChains = Object.values(coinbaseChains).map((c) => ({
      label: c.chainName,
      value: c,
      LeftIcon: c.IconComponent,
    }));

    return [...cosmosChainsOptions, ...evmChains];
  }, [coinbaseChains, cosmosChains]);

  // Currency options generators
  const getSourceCurrencyOptions = useCallback(
    (chain: CosmosChainInfo | EvmChainInfo | null) => {
      if (!chain || !chain.currencies) {
        return [];
      }

      return chain.currencies
        .filter((c) => {
          // only include bridgeable tokens
          if ("isBridgeable" in c) {
            return c.isBridgeable;
          }
          return true;
        })
        .map((c) => ({
          label: c.coinDenom,
          value: c,
          LeftIcon: c.IconComponent,
        }));
    },
    [],
  );

  const getDestinationCurrencyOptions = useCallback(
    (chain: CosmosChainInfo | EvmChainInfo | null) => {
      if (!chain || !chain.currencies) {
        return [];
      }

      return chain.currencies
        .filter((c) => {
          // only include bridgeable tokens
          if ("isBridgeable" in c) {
            return c.isBridgeable;
          }
          return true;
        })
        .map((currency) => ({
          label: currency.coinDenom,
          value: currency,
          LeftIcon: currency.IconComponent,
        }));
    },
    [],
  );

  // Utility to find matching currency
  const findMatchingDestinationCurrency = useCallback(
    (
      sourceChain: CosmosChainInfo | EvmChainInfo | null,
      sourceCurrency: EvmCurrency | IbcCurrency | null,
      destinationChain: CosmosChainInfo | EvmChainInfo | null,
    ) => {
      if (
        !sourceChain ||
        !sourceCurrency ||
        !destinationChain ||
        !destinationChain.currencies
      ) {
        return null;
      }

      const matchingCurrency = destinationChain.currencies.find(
        (currency) => currency.coinDenom === sourceCurrency.coinDenom,
      );

      if (!matchingCurrency) {
        return null;
      }

      return {
        label: matchingCurrency.coinDenom,
        value: matchingCurrency,
        LeftIcon: matchingCurrency.IconComponent,
      };
    },
    [],
  );

  return {
    sourceChainOptions,
    destinationChainOptions,
    getSourceCurrencyOptions,
    getDestinationCurrencyOptions,
    findMatchingDestinationCurrency,
  };
}
