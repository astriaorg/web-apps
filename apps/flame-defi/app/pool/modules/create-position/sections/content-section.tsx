"use client";

import Big from "big.js";
import { useEvmChainData } from "config";
import { useGetPool } from "pool/hooks/use-get-pool";
import { usePageContext } from "pool/hooks/use-page-context";
import { FeeTierSelect } from "pool/modules/create-position/components/fee-tier-select";
import { SwapButton } from "pool/modules/create-position/components/swap-button";
import { TokenAmountInput } from "pool/modules/create-position/components/token-amount-input";
import { useCallback, useMemo, useState } from "react";

enum INPUT {
  INPUT_0 = "INPUT_0",
  INPUT_1 = "INPUT_1",
}

export const ContentSection = () => {
  const { selectedChain } = useEvmChainData();
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
    setSelectedFeeTier,
  } = usePageContext();

  const [currentInput, setCurrentInput] = useState<INPUT>(INPUT.INPUT_0);

  const handleInputError = useCallback(
    (input: INPUT) => {
      const onInput = input === INPUT.INPUT_0 ? onInput1 : onInput0;
      onInput({ value: "" });
    },
    [onInput0, onInput1],
  );

  const handleInputSuccess = useCallback(
    (
      input: INPUT,
      {
        rateToken1ToToken0,
        rateToken0ToToken1,
        amount0,
        amount1,
        token0Decimals,
        token1Decimals,
      }: {
        rateToken1ToToken0: string;
        rateToken0ToToken1: string;
        amount0: string;
        amount1: string;
        token0Decimals?: number;
        token1Decimals?: number;
      },
    ) => {
      if (input === INPUT.INPUT_0 && token1Decimals && amount0) {
        onInput1({
          value: new Big(amount0)
            .mul(rateToken1ToToken0)
            .toFixed(token1Decimals),
        });
      }

      if (input === INPUT.INPUT_1 && token0Decimals && amount1) {
        onInput0({
          value: new Big(amount1)
            .mul(rateToken0ToToken1)
            .toFixed(token0Decimals),
        });
      }
    },
    [onInput0, onInput1],
  );

  const { data: pool, isPending } = useGetPool({
    token0,
    token1,
    selectedFeeTier,
    onError: () => {
      handleInputError(currentInput);
    },
    onSuccess: ({ rateToken0ToToken1, rateToken1ToToken0 }) => {
      handleInputSuccess(currentInput, {
        amount0: amount0.value,
        amount1: amount1.value,
        rateToken1ToToken0,
        rateToken0ToToken1,
        token0Decimals: token0?.coinDecimals,
        token1Decimals: token1?.coinDecimals,
      });
    },
  });

  const updateExchangeRate = useCallback(
    ({ value, input }: { value: string; input: INPUT }) => {
      if (isPending) {
        return;
      }

      if (!pool) {
        handleInputError(input);
        return;
      }

      handleInputSuccess(input, {
        amount0: input === INPUT.INPUT_0 ? value : "",
        amount1: input === INPUT.INPUT_1 ? value : "",
        rateToken1ToToken0: pool.rateToken1ToToken0,
        rateToken0ToToken1: pool.rateToken0ToToken1,
        token0Decimals: token0?.coinDecimals,
        token1Decimals: token1?.coinDecimals,
      });
    },
    [isPending, pool, token0, token1, handleInputError, handleInputSuccess],
  );

  const handleInputSwap = useCallback(
    () => {
      // TODO.
      // onInput0({ value: amount1.value });
      // onInput1({ value: amount0.value });
      // setToken0(token1);
      // setToken1(token0);
      // setCurrentInput(currentInput === INPUT.INPUT_0 ? INPUT.INPUT_1 : INPUT.INPUT_);
    },
    [
      // amount0,
      // amount1,
      // token0,
      // token1,
      // setToken0,
      // setToken1,
      // onInput0,
      // onInput1,
      // currentInput,
    ],
  );

  const optionsToken0 = useMemo(() => {
    return selectedChain.currencies.filter(
      (currency) =>
        currency.erc20ContractAddress !== token1?.erc20ContractAddress,
    );
  }, [selectedChain.currencies, token1]);

  const optionsToken1 = useMemo(() => {
    return selectedChain.currencies.filter(
      (currency) =>
        currency.erc20ContractAddress !== token0?.erc20ContractAddress,
    );
  }, [selectedChain.currencies, token0]);

  // TODO: Clean up repeated code.
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <TokenAmountInput
          value={amount0.value}
          onInput={({ value }) => {
            onInput0({ value });
            setCurrentInput(INPUT.INPUT_0);
            updateExchangeRate({
              value,
              input: INPUT.INPUT_0,
            });
          }}
          selectedToken={token0}
          setSelectedToken={(value) => {
            setToken0(value);
            onInput0({ value: "" });
            onInput1({ value: "" });
          }}
          options={optionsToken0}
        />
        <SwapButton onClick={handleInputSwap} />
        <TokenAmountInput
          value={amount1.value}
          onInput={({ value }) => {
            onInput1({ value });
            setCurrentInput(INPUT.INPUT_1);
            updateExchangeRate({
              value,
              input: INPUT.INPUT_1,
            });
          }}
          selectedToken={token1}
          setSelectedToken={(value) => {
            setToken1(value);
            onInput0({ value: "" });
            onInput1({ value: "" });
          }}
          options={optionsToken1}
        />
      </div>
      <FeeTierSelect
        value={selectedFeeTier}
        onChange={(value) => setSelectedFeeTier(value)}
      />
    </div>
  );
};
