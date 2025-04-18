"use client";

import type { EvmCurrency } from "@repo/flame-types";
import { useAssetAmountInput, type Amount } from "@repo/ui/components";
import { useEvmChainData } from "config";
import { FEE_TIER, type FeeTier } from "pool/constants";
import { useGetPoolTokenBalances } from "pool/hooks";
import { createContext, PropsWithChildren, useState } from "react";

export interface PageContextProps extends PropsWithChildren {
  amount0: Amount;
  amount1: Amount;
  onInput0: ({ value }: { value: string }) => void;
  onInput1: ({ value }: { value: string }) => void;
  token0: EvmCurrency;
  token1: EvmCurrency;
  setToken0: (value: EvmCurrency) => void;
  setToken1: (value: EvmCurrency) => void;
  selectedFeeTier: FeeTier;
  setSelectedFeeTier: (value: FeeTier) => void;
}

export const PageContext = createContext<PageContextProps | undefined>(
  undefined,
);

export const PageContextProvider = ({ children }: PropsWithChildren) => {
  const { selectedChain } = useEvmChainData();

  const [selectedFeeTier, setSelectedFeeTier] = useState<FeeTier>(
    FEE_TIER.MEDIUM,
  );

  const [token0, setToken0] = useState<EvmCurrency>(
    selectedChain.currencies.find((it) => it.coinDenom === "TIA")!,
  );
  const [token1, setToken1] = useState<EvmCurrency>(
    selectedChain.currencies.find((it) => it.coinDenom === "dTIA")!,
  );

  const { token0Balance, token1Balance } = useGetPoolTokenBalances(
    token0.coinDenom ?? "",
    token1?.coinDenom ?? "",
  );

  const {
    amount: amount0,
    onInput: onInput0,
    // isValid: isValid0,
  } = useAssetAmountInput({
    balance: token0Balance?.symbol,
    minimum: "0",
    asset: {
      symbol: token0.coinDenom,
      decimals: token0.coinDecimals,
    },
  });

  const {
    amount: amount1,
    onInput: onInput1,
    // isValid: isValid1,
  } = useAssetAmountInput({
    balance: token1Balance?.symbol,
    minimum: "0",
    asset: token1
      ? {
          symbol: token1.coinDenom,
          decimals: token1.coinDecimals,
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
        selectedFeeTier,
        setSelectedFeeTier,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
