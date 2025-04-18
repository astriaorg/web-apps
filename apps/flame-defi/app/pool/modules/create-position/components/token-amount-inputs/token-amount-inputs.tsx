import Big from "big.js";
import { useGetPool } from "pool/hooks/use-get-pool";
import { usePageContext } from "pool/hooks/use-page-context";
import { useCallback, useEffect } from "react";
import { SwapButton } from "./swap-button";
import { TokenAmountInput } from "./token-amount-input";

export const TokenAmountInputs = () => {
  const {
    amount0,
    amount1,
    onInput0,
    onInput1,
    token0,
    token1,
    setToken0,
    setToken1,
    selectedFeeTier,
  } = usePageContext();

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
      onInputActive,
      onInputInactive,
    }: {
      value: string;
      rate?: string;
      decimals?: number;
      /**
       * The active input being changed.
       */
      onInputActive: ({ value }: { value: string }) => void;
      /**
       * The inactive input, which will be auto-populated based on the active input.
       */
      onInputInactive: ({ value }: { value: string }) => void;
    }) => {
      onInputActive({ value });

      if (!pool || isPending || !value || !rate || !decimals) {
        return;
      }

      onInputInactive({
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
      <TokenAmountInput
        value={amount0.value}
        onInput={({ value }) =>
          handleInputChange({
            value,
            rate: pool?.rateToken1ToToken0,
            decimals: token1?.coinDecimals,
            onInputActive: onInput0,
            onInputInactive: onInput1,
          })
        }
        selectedToken={token0}
        setSelectedToken={setToken0}
      />
      <SwapButton onClick={handleInputSwap} />
      <TokenAmountInput
        value={amount1.value}
        onInput={({ value }) =>
          handleInputChange({
            value,
            rate: pool?.rateToken0ToToken1,
            decimals: token0?.coinDecimals,
            onInputActive: onInput1,
            onInputInactive: onInput0,
          })
        }
        selectedToken={token1}
        setSelectedToken={setToken1}
      />
    </div>
  );
};
