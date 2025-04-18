import type { EvmCurrency } from "@repo/flame-types";
import {
  Card,
  CardContent,
  CardFigureInput,
  type Amount,
} from "@repo/ui/components";
import Big from "big.js";
import { useEvmChainData } from "config";
import { TokenSelect } from "pool/components/token-select";
import type { FeeTier } from "pool/constants/pool-constants";
import { useGetPool } from "pool/hooks/use-get-pool";
import { useCallback, useEffect, useMemo } from "react";
import { SwapButton } from "./swap-button";

interface TokenAmountInputsProps {
  amount0: Amount;
  amount1: Amount;
  onInput0: ({ value }: { value: string }) => void;
  onInput1: ({ value }: { value: string }) => void;
  token0: EvmCurrency;
  token1: EvmCurrency;
  setToken0: (token: EvmCurrency) => void;
  setToken1: (token: EvmCurrency) => void;
  selectedFeeTier: FeeTier;
}

export const TokenAmountInputs = ({
  amount0,
  amount1,
  onInput0,
  onInput1,
  token0,
  token1,
  setToken0,
  setToken1,
  selectedFeeTier,
}: TokenAmountInputsProps) => {
  const { selectedChain } = useEvmChainData();

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
        return;
      }

      onInputB({
        value: new Big(value).mul(rate).toFixed(decimals),
      });
    },
    [isPending, pool],
  );

  const handleInputSwap = useCallback(() => {
    setToken0(token1);
    setToken1(token0);
    onInput0({ value: amount1.value });
    onInput1({ value: amount0.value });
  }, [
    amount0,
    amount1,
    token0,
    token1,
    setToken0,
    setToken1,
    onInput0,
    onInput1,
  ]);

  return (
    <div className="flex flex-col gap-2">
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
      <SwapButton onClick={handleInputSwap} />
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
    </div>
  );
};
