"use client";

import Big from "big.js";
import { useAstriaChainData } from "config";
import { motion, type Transition } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { EvmCurrency } from "@repo/flame-types";
import type { Amount } from "@repo/ui/components";
import { useValidateTokenAmount } from "@repo/ui/hooks";
import { formatNumberWithoutTrailingZeros } from "@repo/ui/utils";
import { filterPoolTokens } from "pool/components/token-select";
import { useGetPools } from "pool/hooks/use-get-pools";
import { FeeTierSelect } from "pool/modules/create-position/components/fee-tier-select";
import { InitialPriceInput } from "pool/modules/create-position/components/initial-price-input";
import { PriceRangeInput } from "pool/modules/create-position/components/price-range-input";
import { SubmitButton } from "pool/modules/create-position/components/submit-button";
import { SwapButton } from "pool/modules/create-position/components/swap-button";
import { TokenAmountInput } from "pool/modules/create-position/components/token-amount-input";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";
import { DepositType, InputId } from "pool/types";
import {
  calculateDepositType,
  getAmount0ForLiquidity,
  getAmount1ForLiquidity,
} from "pool/utils";

const TRANSITION: Transition = {
  duration: 0.1,
  type: "spring",
  damping: 30,
  stiffness: 500,
};

export const ContentSection = () => {
  const { chain } = useAstriaChainData();
  const validate = useValidateTokenAmount();
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
    currentInput,
    setCurrentInput,
    feeTier,
    setFeeTier,
    minPrice,
    maxPrice,
    isPriceRangeValid,
    amountInitialPrice,
  } = usePageContext();

  const [isInverted, setIsInverted] = useState(false);

  const [depositType, setDepositType] = useState(DepositType.BOTH);

  const { data: pools, isPending } = useGetPools({
    token0,
    token1,
  });

  const pool = useMemo(() => {
    return pools?.[feeTier] ?? null;
  }, [pools, feeTier]);

  const rate = useMemo(() => {
    return isInverted ? pool?.rateToken0ToToken1 : pool?.rateToken1ToToken0;
  }, [isInverted, pool]);

  const derivedValues = useMemo((): {
    derivedAmount0: Amount;
    derivedAmount1: Amount;
  } => {
    if (isPending || !token0 || !token1) {
      return {
        derivedAmount0: amount0,
        derivedAmount1: amount1,
      };
    }

    const getDerivedAmount = (
      amount: string,
      token: EvmCurrency,
      balance?: string,
    ): Amount => {
      return {
        value: amount,
        validation: validate({
          value: amount,
          token: {
            symbol: token.coinDenom,
            decimals: token.coinDecimals,
          },
          decimals: token.coinDecimals,
          minimum: "0",
          maximum: balance,
        }),
      };
    };

    if (!pool) {
      if (!amountInitialPrice.validation.isValid) {
        return {
          derivedAmount0: amount0,
          derivedAmount1: amount1,
        };
      }

      // When there's no pool, derive the amount from the initial price.
      if (currentInput === InputId.INPUT_0 && amount0.value) {
        const derivedAmount1 = getAmount1ForLiquidity({
          amount0: amount0.value,
          price: Number(amountInitialPrice.value),
          decimal1: token1.coinDecimals,
        });
        return {
          derivedAmount0: amount0,
          derivedAmount1: getDerivedAmount(
            formatNumberWithoutTrailingZeros(derivedAmount1),
            token1,
            token1Balance?.value,
          ),
        };
      }
      if (currentInput === InputId.INPUT_1 && amount1.value) {
        const derivedAmount0 = getAmount0ForLiquidity({
          amount1: amount1.value,
          price: Number(amountInitialPrice.value),
          decimal0: token0.coinDecimals,
        });
        return {
          derivedAmount0: getDerivedAmount(
            formatNumberWithoutTrailingZeros(derivedAmount0),
            token0,
            token0Balance?.value,
          ),
          derivedAmount1: amount1,
        };
      }
    }

    if (currentInput === InputId.INPUT_0 && amount0.value) {
      const derivedAmount1 = new Big(amount0.value)
        .mul(rate as string)
        .toFixed(token1.coinDecimals);
      return {
        derivedAmount0: amount0,
        derivedAmount1: getDerivedAmount(
          formatNumberWithoutTrailingZeros(derivedAmount1),
          token1,
          token1Balance?.value,
        ),
      };
    }

    if (currentInput === InputId.INPUT_1 && amount1.value) {
      const derivedAmount0 = new Big(amount1.value)
        .mul(new Big(1).div(rate as string))
        .toFixed(token0.coinDecimals);
      return {
        derivedAmount0: getDerivedAmount(
          formatNumberWithoutTrailingZeros(derivedAmount0),
          token0,
          token0Balance?.value,
        ),
        derivedAmount1: amount1,
      };
    }

    return {
      derivedAmount0: getDerivedAmount("", token0, token0Balance?.value),
      derivedAmount1: getDerivedAmount("", token1, token1Balance?.value),
    };
  }, [
    pool,
    rate,
    isPending,
    currentInput,
    amount0,
    amount1,
    token0,
    token1,
    token0Balance,
    token1Balance,
    amountInitialPrice,
    validate,
  ]);

  const optionsToken0 = useMemo(
    () => filterPoolTokens(chain.currencies, token1),
    [chain.currencies, token1],
  );

  const optionsToken1 = useMemo(
    () => filterPoolTokens(chain.currencies, token0),
    [chain.currencies, token0],
  );

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

  // Handle single asset deposit when initial price exceeds the min or max price.
  useEffect(() => {
    if (!isPriceRangeValid || !amountInitialPrice.validation.isValid) {
      return;
    }

    if (pool) {
      setDepositType(DepositType.BOTH);
      return;
    }

    const depositType = calculateDepositType({
      currentPrice: Number(amountInitialPrice.value),
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
    });

    setDepositType(depositType);
  }, [amountInitialPrice, minPrice, maxPrice, isPriceRangeValid, pool]);

  return (
    <div className="flex flex-col gap-6">
      {!isPending && !pool && <InitialPriceInput />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side. */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col">
            {(depositType === DepositType.BOTH ||
              depositType === DepositType.TOKEN_0_ONLY) && (
              <motion.div
                layout
                transition={TRANSITION}
                key={isInverted ? InputId.INPUT_1 : InputId.INPUT_0}
              >
                <TokenAmountInput
                  value={derivedValues.derivedAmount0.value}
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
                key={isInverted ? InputId.INPUT_0 : InputId.INPUT_1}
              >
                <TokenAmountInput
                  value={derivedValues.derivedAmount1.value}
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
            value={feeTier}
            onChange={(value) => {
              setFeeTier(value);
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
          <PriceRangeInput rate={rate} />

          <SubmitButton
            pool={pool}
            depositType={depositType}
            amount0={derivedValues.derivedAmount0}
            amount1={derivedValues.derivedAmount1}
          />
        </div>
      </div>
    </div>
  );
};
