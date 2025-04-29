"use client";

import { useTokenAmountInput } from "@repo/ui/components";
import { formatNumberWithoutTrailingZeros } from "@repo/ui/utils";
import Big from "big.js";
import { useAstriaChainData } from "config";
import { motion, type Transition } from "motion/react";
import { useGetPools } from "pool/hooks/use-get-pools";
import { FeeTierSelect } from "pool/modules/create-position/components/fee-tier-select";
import { InitialPriceInput } from "pool/modules/create-position/components/initial-price-input";
import { PriceRangeInput } from "pool/modules/create-position/components/price-range-input";
import { SwapButton } from "pool/modules/create-position/components/swap-button";
import { TokenAmountInput } from "pool/modules/create-position/components/token-amount-input";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";
import {
  MAX_PRICE_DEFAULT,
  MIN_PRICE_DEFAULT,
} from "pool/modules/create-position/types";
import { useCallback, useEffect, useMemo, useState } from "react";

enum InputId {
  INPUT_0 = "INPUT_0",
  INPUT_1 = "INPUT_1",
}

enum DepositType {
  TOKEN_0_ONLY = "TOKEN_0_ONLY",
  TOKEN_1_ONLY = "TOKEN_1_ONLY",
  BOTH = "BOTH",
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
    isLoadingToken0Balance,
    isLoadingToken1Balance,
    selectedFeeTier,
    setSelectedFeeTier,
  } = usePageContext();

  // Store the last edited input to identify which input holds the user’s value and which to display the derived value.
  const [currentInput, setCurrentInput] = useState<InputId>(InputId.INPUT_0);
  const [isInverted, setIsInverted] = useState(false);

  const [minPrice, setMinPrice] = useState<string>(
    MIN_PRICE_DEFAULT.toString(),
  );
  const [maxPrice, setMaxPrice] = useState<string>(
    MAX_PRICE_DEFAULT.toString(),
  );

  const [depositType, setDepositType] = useState(DepositType.BOTH);

  const { data: pools, isPending } = useGetPools({
    token0,
    token1,
  });

  const pool = useMemo(() => {
    return pools?.[selectedFeeTier];
  }, [pools, selectedFeeTier]);

  const rate = useMemo(() => {
    return isInverted ? pool?.rateToken0ToToken1 : pool?.rateToken1ToToken0;
  }, [isInverted, pool]);

  const derivedValues = useMemo(() => {
    if (!pool || isPending) {
      // When there's no pool, the user can enter any value in both inputs to initialize the position.
      return {
        derivedAmount0: amount0.value,
        derivedAmount1: amount1.value,
      };
    }

    if (currentInput === InputId.INPUT_0 && amount0.value) {
      const derivedAmount1 = new Big(amount0.value)
        .mul(rate as string)
        .toFixed(token1?.coinDecimals || 0);
      return {
        derivedAmount0: amount0.value,
        derivedAmount1: formatNumberWithoutTrailingZeros(derivedAmount1),
      };
    }

    if (currentInput === InputId.INPUT_1 && amount1.value) {
      const derivedAmount0 = new Big(amount1.value)
        .mul(new Big(1).div(rate as string))
        .toFixed(token0?.coinDecimals || 0);
      return {
        derivedAmount0: formatNumberWithoutTrailingZeros(derivedAmount0),
        derivedAmount1: amount1.value,
      };
    }

    return { derivedAmount0: "", derivedAmount1: "" };
  }, [
    pool,
    rate,
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

  const handleSwap = useCallback(() => {
    setIsInverted((value) => !value);

    setToken0(token1);
    setToken1(token0);
    onInput0({ value: amount1.value });
    onInput1({ value: amount0.value });

    if (currentInput === InputId.INPUT_0) {
      setCurrentInput(InputId.INPUT_1);
    } else {
      setCurrentInput(InputId.INPUT_0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentInput, amount0.value, amount1.value, token0, token1]);

  const { amount: initialPrice, onInput: setInitialPrice } =
    useTokenAmountInput({
      token: token0
        ? {
            symbol: token0?.coinDenom,
            decimals: token0?.coinDecimals,
          }
        : undefined,
    });

  // Handle single asset deposit when initial price exceeds the min or max price.
  useEffect(() => {
    if (minPrice === "" || maxPrice === "") {
      return;
    }

    if (!!pool || !initialPrice.validation.isValid) {
      setDepositType(DepositType.BOTH);
      return;
    }

    if (new Big(initialPrice.value).lt(minPrice)) {
      setDepositType(DepositType.TOKEN_1_ONLY);
    } else if (
      maxPrice !== MAX_PRICE_DEFAULT.toString() &&
      new Big(initialPrice.value).gt(maxPrice)
    ) {
      setDepositType(DepositType.TOKEN_0_ONLY);
    } else {
      setDepositType(DepositType.BOTH);
    }
  }, [initialPrice, minPrice, maxPrice, pool]);

  return (
    <div className="flex flex-col gap-6">
      {!isPending && !pool && (
        <InitialPriceInput
          rate={rate}
          value={initialPrice.value}
          onInput={(event) =>
            setInitialPrice({ value: event.currentTarget.value })
          }
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side. */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            {(depositType === DepositType.BOTH ||
              depositType === DepositType.TOKEN_0_ONLY) && (
              <motion.div
                layout
                transition={TRANSITION}
                key={isInverted ? "token1" : "token0"}
              >
                <TokenAmountInput
                  value={derivedValues.derivedAmount0}
                  onInput={({ value }) => {
                    onInput0({ value });
                    setCurrentInput(InputId.INPUT_0);
                  }}
                  selectedToken={token0}
                  setSelectedToken={(value) => {
                    setToken0(value);
                    onInput0({ value: "" });
                    onInput1({ value: "" });
                  }}
                  options={optionsToken0}
                  balance={token0Balance}
                  isLoading={isLoadingToken0Balance}
                />
              </motion.div>
            )}
            {depositType === DepositType.BOTH && (
              <SwapButton onClick={() => handleSwap()} />
            )}
            {(depositType === DepositType.BOTH ||
              depositType === DepositType.TOKEN_1_ONLY) && (
              <motion.div
                layout
                transition={TRANSITION}
                key={isInverted ? "token0" : "token1"}
              >
                <TokenAmountInput
                  value={derivedValues.derivedAmount1}
                  onInput={({ value }) => {
                    onInput1({ value });
                    setCurrentInput(InputId.INPUT_1);
                  }}
                  selectedToken={token1}
                  setSelectedToken={(value) => {
                    setToken1(value);
                    onInput0({ value: "" });
                    onInput1({ value: "" });
                  }}
                  options={optionsToken1}
                  balance={token1Balance}
                  isLoading={isLoadingToken1Balance}
                />
              </motion.div>
            )}
          </div>
          <FeeTierSelect
            value={selectedFeeTier}
            onChange={(value) => {
              setSelectedFeeTier(value);
              // If the pool exists, the derived value will replace the empty string.
              // Otherwise, don't persist values from previous edits.
              if (currentInput === InputId.INPUT_0) {
                onInput1({ value: "" });
              } else {
                onInput0({ value: "" });
              }
            }}
          />
        </div>

        {/* Right side. */}
        <div className="flex flex-col gap-4">
          <PriceRangeInput
            rate={rate}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
          />
        </div>
      </div>
    </div>
  );
};
