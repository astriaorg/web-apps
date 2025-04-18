"use client";

import type { EvmCurrency } from "@repo/flame-types";
import { useAssetAmountInput } from "@repo/ui/components";
import { useEvmChainData } from "config";
import { FEE_TIER, type FeeTier } from "pool/constants/pool-constants";
import { useGetPoolTokenBalances } from "pool/hooks";
import { FeeTierSelect } from "pool/modules/create-position/components/fee-tier-select";
import { TokenAmountInputs } from "pool/modules/create-position/components/token-amount-inputs";
import { useState } from "react";

export const ContentSection = () => {
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
    <div className="flex flex-col gap-4">
      <TokenAmountInputs
        amount0={amount0}
        amount1={amount1}
        onInput0={onInput0}
        onInput1={onInput1}
        token0={token0}
        token1={token1}
        setToken0={setToken0}
        setToken1={setToken1}
        selectedFeeTier={selectedFeeTier}
      />

      <FeeTierSelect value={selectedFeeTier} onChange={setSelectedFeeTier} />
    </div>
  );
};
