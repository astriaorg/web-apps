"use client";

import { useAstriaChainData } from "config";
import {
  MAX_PRICE_DEFAULT,
  MIN_PRICE_DEFAULT,
} from "pool/modules/create-position/types";
import { FEE_TIER, type FeeTier } from "pool/types";
import { createContext, PropsWithChildren, useState } from "react";

import type { EvmCurrency } from "@repo/flame-types";
import { type Amount, useTokenAmountInput } from "@repo/ui/components";
import { useEvmCurrencyBalance } from "features/evm-wallet";

export interface PageContextProps extends PropsWithChildren {
  amount0: Amount;
  amount1: Amount;
  onInput0: ({ value }: { value: string }) => void;
  onInput1: ({ value }: { value: string }) => void;
  token0?: EvmCurrency;
  token1?: EvmCurrency;
  token0Balance: { symbol: string; value: string } | null;
  token1Balance: { symbol: string; value: string } | null;
  setToken0: (value?: EvmCurrency) => void;
  setToken1: (value?: EvmCurrency) => void;
  isLoadingToken0Balance: boolean;
  isLoadingToken1Balance: boolean;
  feeTier: FeeTier;
  setFeeTier: (value: FeeTier) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  amountInitialPrice: Amount;
  setAmountInitialPrice: ({ value }: { value: string }) => void;
}

export const PageContext = createContext<PageContextProps | undefined>(
  undefined,
);

export const PageContextProvider = ({ children }: PropsWithChildren) => {
  const { chain } = useAstriaChainData();

  const [feeTier, setFeeTier] = useState<FeeTier>(FEE_TIER.MEDIUM);

  const [minPrice, setMinPrice] = useState<string>(
    MIN_PRICE_DEFAULT.toString(),
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    MAX_PRICE_DEFAULT.toString(),
  );

  const [token0, setToken0] = useState<EvmCurrency | undefined>(
    chain.currencies[0],
  );
  const [token1, setToken1] = useState<EvmCurrency | undefined>();

  const { balance: token0Balance, isLoading: isLoadingToken0Balance } =
    useEvmCurrencyBalance(token0);
  const { balance: token1Balance, isLoading: isLoadingToken1Balance } =
    useEvmCurrencyBalance(token1);

  // TODO: Figure out why validation is always false.
  const {
    amount: amount0,
    onInput: onInput0,
    // isValid: isValid0,
  } = useTokenAmountInput({
    balance: token0Balance?.symbol,
    minimum: "0",
    token: token0
      ? {
          symbol: token0?.coinDenom,
          decimals: token0?.coinDecimals,
        }
      : undefined,
  });

  const {
    amount: amount1,
    onInput: onInput1,
    // isValid: isValid1,
  } = useTokenAmountInput({
    balance: token1Balance?.symbol,
    minimum: "0",
    token: token1
      ? {
          symbol: token1.coinDenom,
          decimals: token1.coinDecimals,
        }
      : undefined,
  });

  const { amount: amountInitialPrice, onInput: setAmountInitialPrice } =
    useTokenAmountInput({
      token: token0
        ? {
            symbol: token0?.coinDenom,
            decimals: token0?.coinDecimals,
          }
        : undefined,
    });

  return (
    <PageContext.Provider
      value={{
        amount0,
        amount1,
        onInput0,
        onInput1,
        token0,
        token1,
        setToken0,
        setToken1,
        token0Balance,
        token1Balance,
        isLoadingToken0Balance,
        isLoadingToken1Balance,
        feeTier,
        setFeeTier,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        amountInitialPrice,
        setAmountInitialPrice,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
