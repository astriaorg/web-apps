"use client";

import { useCallback, useMemo } from "react";

import {
  CosmosChainInfo,
  EvmChainInfo,
  EvmCurrency,
  IbcCurrency,
} from "@repo/flame-types";
import { DropdownOption } from "components/dropdown";

export interface BridgeOptions {
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

export interface UseBridgeOptionsProps {
  sourceChains: (CosmosChainInfo | EvmChainInfo)[];
  destinationChains: (CosmosChainInfo | EvmChainInfo)[];
}

export function useBridgeOptions({
  sourceChains,
  destinationChains,
}: UseBridgeOptionsProps): BridgeOptions {
  // Chain options
  const sourceChainOptions = useMemo(() => {
    return sourceChains.map((c) => ({
      label: c.chainName,
      value: c,
      LeftIcon: c.IconComponent,
    }));
  }, [sourceChains]);

  const destinationChainOptions = useMemo(() => {
    return destinationChains.map((c) => ({
      label: c.chainName,
      value: c,
      LeftIcon: c.IconComponent,
    }));
  }, [destinationChains]);

  // Currency options generators
  const getSourceCurrencyOptions = useCallback(
    (chain: CosmosChainInfo | EvmChainInfo | null) => {
      if (!chain || !chain.currencies) {
        return [];
      }

      return chain.currencies
        .filter((c) => c.isBridgeable && c.coinDenom === "TIA")
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
        .filter((c) => c.isBridgeable && c.coinDenom === "TIA")
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
