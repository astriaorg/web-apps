"use client";

import type { EvmCurrency } from "@repo/flame-types";
import { formatNumberWithoutTrailingZeros } from "@repo/ui/utils";
import Big from "big.js";
import { useAstriaChainData } from "config";
import { motion, type Transition } from "motion/react";
import { useGetPools } from "pool/hooks/use-get-pools";
import { FeeTierSelect } from "pool/modules/create-position/components/fee-tier-select";
import { PriceRange } from "pool/modules/create-position/components/price-range";
import { SwapButton } from "pool/modules/create-position/components/swap-button";
import { TokenAmountInput } from "pool/modules/create-position/components/token-amount-input";
import { UninitializedPoolWarning } from "pool/modules/create-position/components/uninitialized-pool-warning";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";
import { useMemo, useState } from "react";

enum INPUT {
  INPUT_0 = "INPUT_0",
  INPUT_1 = "INPUT_1",
}

const TRANSITION: Transition = {
  duration: 0.1,
  type: "spring",
  damping: 30,
  stiffness: 500,
};

export const ContentSection = () => {
  const { chain } = useAstriaChainData();
  const {
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
    selectedFeeTier,
    setSelectedFeeTier,
  } = usePageContext();

  // Store the last edited input to identify which input holds the user’s value and which to display the derived value.
  const [currentInput, setCurrentInput] = useState<INPUT>(INPUT.INPUT_0);
  // Handles the click of the swap button. Instead of swapping state, handle via CSS.
  const [isInverted, setIsInverted] = useState(false);

  const { data: pools, isPending } = useGetPools({
    token0,
    token1,
  });

  const pool = useMemo(() => {
    return pools?.[selectedFeeTier];
  }, [pools, selectedFeeTier]);

  const derivedValues = useMemo(() => {
    if (!pool || isPending) {
      // When there's no pool, the user can enter any value in both inputs to initialize the position.
      return {
        derivedAmount0: amount0.value,
        derivedAmount1: amount1.value,
      };
    }

    if (currentInput === INPUT.INPUT_0 && amount0.value) {
      const derivedAmount1 = new Big(amount0.value)
        .mul(pool.rateToken1ToToken0)
        .toFixed(token1?.coinDecimals || 0);
      return {
        derivedAmount0: amount0.value,
        derivedAmount1: formatNumberWithoutTrailingZeros(derivedAmount1),
      };
    }

    if (currentInput === INPUT.INPUT_1 && amount1.value) {
      const derivedAmount0 = new Big(amount1.value)
        .mul(pool.rateToken0ToToken1)
        .toFixed(token0?.coinDecimals || 0);
      return {
        derivedAmount0: formatNumberWithoutTrailingZeros(derivedAmount0),
        derivedAmount1: amount1.value,
      };
    }

    return { derivedAmount0: "", derivedAmount1: "" };
  }, [
    pool,
    isPending,
    currentInput,
    amount0.value,
    amount1.value,
    token0,
    token1,
  ]);

  const optionsToken0 = useMemo(() => {
    return chain.currencies.filter((currency) =>
      token1
        ? currency.erc20ContractAddress !== token1.erc20ContractAddress
        : true,
    );
  }, [chain.currencies, token1]);

  const optionsToken1 = useMemo(() => {
    return chain.currencies.filter((currency) =>
      token0
        ? currency.erc20ContractAddress !== token0.erc20ContractAddress
        : true,
    );
  }, [chain.currencies, token0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left side. */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <motion.div
            layout
            style={{ order: isInverted ? 2 : 0 }}
            transition={TRANSITION}
          >
            <TokenAmountInput
              value={derivedValues.derivedAmount0}
              onInput={({ value }) => {
                onInput0({ value });
                setCurrentInput(INPUT.INPUT_0);
              }}
              selectedToken={token0}
              setSelectedToken={(value) => {
                setToken0(value);
                onInput0({ value: "" });
                onInput1({ value: "" });
              }}
              options={optionsToken0}
              balance={token0Balance}
            />
          </motion.div>
          <motion.div style={{ order: 1 }}>
            <SwapButton onClick={() => setIsInverted((value) => !value)} />
          </motion.div>
          <motion.div
            layout
            style={{ order: isInverted ? 0 : 2 }}
            transition={TRANSITION}
          >
            <TokenAmountInput
              value={derivedValues.derivedAmount1}
              onInput={({ value }) => {
                onInput1({ value });
                setCurrentInput(INPUT.INPUT_1);
              }}
              selectedToken={token1}
              setSelectedToken={(value) => {
                setToken1(value);
                onInput0({ value: "" });
                onInput1({ value: "" });
              }}
              options={optionsToken1}
              balance={token1Balance}
            />
          </motion.div>
        </div>
        <FeeTierSelect
          value={selectedFeeTier}
          onChange={(value) => {
            setSelectedFeeTier(value);
            // If the pool exists, the derived value will replace the empty string.
            // Otherwise, don't persist values from previous edits.
            if (currentInput === INPUT.INPUT_0) {
              onInput1({ value: "" });
            } else {
              onInput0({ value: "" });
            }
          }}
        />
      </div>

      {/* Right side. */}
      <div>
        {!isPending && !pool && <UninitializedPoolWarning />}
        {!!pool && (
          <PriceRange
            {...(isInverted
              ? {
                  rate: pool.rateToken0ToToken1,
                  token0: token1 as EvmCurrency,
                  token1: token0 as EvmCurrency,
                }
              : {
                  rate: pool.rateToken1ToToken0,
                  token0: token0 as EvmCurrency,
                  token1: token1 as EvmCurrency,
                })}
          />
        )}
      </div>
    </div>
  );
};
