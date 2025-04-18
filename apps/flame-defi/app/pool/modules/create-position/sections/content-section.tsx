"use client";

import type { EvmCurrency } from "@repo/flame-types";
import {
  Card,
  CardContent,
  CardFigureInput,
  useAssetAmountInput,
} from "@repo/ui/components";
import Big from "big.js";
import { useEvmChainData } from "config";
import { TokenSelect } from "pool/components/token-select";
import { FEE_TIER, type FeeTier } from "pool/constants/pool-constants";
import { useGetPoolTokenBalances } from "pool/hooks";
import { useGetPool } from "pool/hooks/use-get-pool";
import { FeeTierSelect } from "pool/modules/create-position/components/fee-tier-select";
import { useCallback, useEffect, useMemo, useState } from "react";

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

  const token0Options = useMemo(() => {
    return selectedChain.currencies.filter(
      (currency) =>
        currency.erc20ContractAddress !== token1.erc20ContractAddress,
    );
  }, [selectedChain.currencies, token1]);

  const token1Options = useMemo(() => {
    return selectedChain.currencies.filter(
      (currency) =>
        currency.erc20ContractAddress !== token0.erc20ContractAddress,
    );
  }, [selectedChain.currencies, token0]);

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

  const { data: pool, isPending } = useGetPool({
    token0,
    token1,
    selectedFeeTier,
  });

  useEffect(() => {
    if (!pool) {
      onInput0({ value: "" });
      onInput1({ value: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  const handleInputChange = useCallback(
    ({
      value,
      rate,
      decimals,
      onInputA,
      onInputB,
    }: {
      value: string;
      rate?: string;
      decimals: number;
      /**
       * The active input being changed.
       */
      onInputA: ({ value }: { value: string }) => void;
      /**
       * The inactive input, which will be auto-populated based on the active input.
       */
      onInputB: ({ value }: { value: string }) => void;
    }) => {
      onInputA({ value });

      if (!pool || isPending || !value || !rate) {
        // onInputB({ value: "" });
        return;
      }

      onInputB({
        value: new Big(value).mul(rate).toFixed(decimals),
      });
    },
    [isPending, pool],
  );

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex items-center justify-between gap-6">
          <CardFigureInput
            value={amount0.value}
            onInput={(event) =>
              handleInputChange({
                value: event.currentTarget.value,
                rate: pool?.rateToken1ToToken0,
                decimals: token1.coinDecimals,
                onInputA: onInput0,
                onInputB: onInput1,
              })
            }
          />
          <div>
            <TokenSelect
              options={token0Options}
              value={token0}
              onValueChange={setToken0}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between gap-6">
          <CardFigureInput
            value={amount1.value}
            onInput={(event) =>
              handleInputChange({
                value: event.currentTarget.value,
                rate: pool?.rateToken0ToToken1,
                decimals: token0.coinDecimals,
                onInputA: onInput1,
                onInputB: onInput0,
              })
            }
          />
          <div>
            <TokenSelect
              options={token1Options}
              value={token1}
              onValueChange={setToken1}
            />
          </div>
        </CardContent>
      </Card>

      <FeeTierSelect value={selectedFeeTier} onChange={setSelectedFeeTier} />
    </div>
  );
};
