"use client";

import debounce from "lodash.debounce";
import { motion } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  EvmCurrency,
  TokenInputState,
  TRADE_TYPE,
  TRADE_TYPE_OPPOSITES,
  TransactionStatus,
} from "@repo/flame-types";
import { Button } from "@repo/ui/components";
import { ConfirmationModal } from "components/confirmation-modal-v2";
import { SWAP_BUTTON_TRANSITION, SwapButton } from "components/swap-button";
import { useAstriaChainData } from "config";
import { useEvmCurrencyBalance, useGetQuote } from "features/evm-wallet";
import {
  TransactionSummary,
  TransactionType,
} from "swap/components/transaction-summary";
import {
  useOneToOneQuote,
  useSwapButton,
  useTransactionInfo,
} from "swap/hooks";
import { SwapInput } from "swap/modules/swap/components/swap-input";
import { TransactionInfo } from "swap/modules/swap/components/transaction-info";
import { InputId, SwapPairProps } from "swap/types";

export const ContentSection = () => {
  const { chain } = useAstriaChainData();
  const { currencies } = chain;

  const [inputOne, setInputOne] = useState<TokenInputState>({
    token: currencies[0],
    value: "",
    isQuoteValue: false,
  });
  const [inputTwo, setInputTwo] = useState<TokenInputState>({
    token: undefined,
    value: "",
    isQuoteValue: true,
  });

  const isTiaWtia = useMemo(() => {
    return Boolean(
      (inputOne.token?.isNative && inputTwo.token?.isWrappedNative) ||
        (inputOne.token?.isWrappedNative && inputTwo.token?.isNative),
    );
  }, [inputOne.token, inputTwo.token]);

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);
  const [flipTokens, setFlipTokens] = useState(false);
  const [tradeType, setTradeType] = useState<TRADE_TYPE>(TRADE_TYPE.EXACT_IN);
  const {
    quote,
    isLoading: loading,
    error: quoteError,
    getQuote,
    setQuote,
    cancelGetQuote,
  } = useGetQuote();

  // TODO: Unify inputOne/INPUT_1 etc. into token0/token1.
  const { balance: inputOneBalance, isLoading: isLoadingToken0Balance } =
    useEvmCurrencyBalance(inputOne.token);
  const { balance: inputTwoBalance, isLoading: isLoadingToken1Balance } =
    useEvmCurrencyBalance(inputTwo.token);

  const swapInputs: SwapPairProps[] = [
    {
      id: InputId.INPUT_0,
      inputToken: inputOne,
      oppositeToken: inputTwo,
      balance: inputOneBalance,
      isBalanceLoading: isLoadingToken0Balance,
      label: flipTokens ? "Buy" : "Sell",
    },
    {
      id: InputId.INPUT_1,
      inputToken: inputTwo,
      oppositeToken: inputOne,
      balance: inputTwoBalance,
      isBalanceLoading: isLoadingToken1Balance,
      label: flipTokens ? "Sell" : "Buy",
    },
  ];

  const swapPairs = (flipTokens ? swapInputs.reverse() : swapInputs) as [
    SwapPairProps,
    SwapPairProps,
  ];
  const token0 = swapPairs[0].inputToken;
  const token1 = swapPairs[1].inputToken;
  const token0Balance = swapPairs[0].balance;

  const oneToOneQuote = useOneToOneQuote(inputOne.token, inputTwo.token);

  const {
    title,
    hash,
    onSubmit,
    buttonText,
    action,
    isValid,
    status,
    setStatus,
    tokenApprovalNeeded,
    error,
    setError,
  } = useSwapButton({
    token0,
    token1,
    token0Balance: token0Balance?.value || "0",
    quote,
    loading,
    error: quoteError,
    tradeType,
  });

  const info = useTransactionInfo({
    quote,
    token0,
    token1,
    tradeType,
    isValid,
  });

  const debouncedGetQuoteRef = useRef(
    debounce(
      (
        tradeType: TRADE_TYPE,
        tokenIn: TokenInputState,
        tokenOut: TokenInputState,
        inputId: InputId,
      ) => {
        getQuote(tradeType, tokenIn, tokenOut).then((res) => {
          if (inputId === InputId.INPUT_0 && res) {
            setInputTwo((prev) => ({
              ...prev,
              value: res.quoteDecimals,
              isQuoteValue: true,
            }));
          } else if (inputId === InputId.INPUT_1 && res) {
            setInputOne((prev) => ({
              ...prev,
              value: res.quoteDecimals,
              isQuoteValue: true,
            }));
          }
        });
      },
      500,
    ),
  );

  // the native currency and wrapped tokens are always the same price,
  // so update inputOne and inputTwo with the same value
  const handleWhenNativeAndWrapped = (value: string) => {
    setInputOne((prev) => ({ ...prev, value: value }));
    setInputTwo((prev) => ({ ...prev, value: value }));
  };

  const handleResetInputs = useCallback(() => {
    setInputOne({ token: token0.token, value: "", isQuoteValue: false });
    setInputTwo({ token: token1.token, value: "", isQuoteValue: true });
    setQuote(null);
    setFlipTokens(false);
    setStatus(TransactionStatus.IDLE);
  }, [setQuote, setStatus, token0, token1]);

  const handleInputChange = useCallback(
    (value: string, inputId: InputId) => {
      setError(undefined);

      // clear all values and cancel any current getQuotes if user zeros input
      if (value === "" || value === "0") {
        setInputOne((prev) => ({ ...prev, value: value }));
        setInputTwo((prev) => ({ ...prev, value: value }));
        cancelGetQuote();
      }

      // we won't have up-to-date inputs after setting them in state,
      // so calculate them here so we can use them to get the quote
      let newInputOne = inputOne;
      let newInputTwo = inputTwo;

      if (inputId === InputId.INPUT_0) {
        newInputOne = { ...inputOne, value, isQuoteValue: false };
        // zero out the other input's value and set it as the quoted value when user types in an input
        newInputTwo = { ...inputTwo, value: "", isQuoteValue: true };
        setInputOne(newInputOne);
        setInputTwo(newInputTwo);
      } else if (inputId === InputId.INPUT_1) {
        newInputTwo = { ...inputTwo, value, isQuoteValue: false };
        // zero out the other input's value and set it as the quoted value when user types in an input
        newInputOne = { ...inputOne, value: "", isQuoteValue: true };
        setInputTwo(newInputTwo);
        setInputOne(newInputOne);
      }

      if (
        (newInputOne.token?.isNative && newInputTwo.token?.isWrappedNative) ||
        (newInputOne.token?.isWrappedNative && newInputTwo.token?.isNative)
      ) {
        handleWhenNativeAndWrapped(value);
        // we don't need to get a quote if we're wrapping/unwrapping,
        // so we can return early
        return;
      }

      // these won't have been recalculated yet, so calculate them here to use in the quote
      const newTopTokenInput = flipTokens ? newInputTwo : newInputOne;
      const newBottomTokenInput = flipTokens ? newInputOne : newInputTwo;
      const newTradeType = newTopTokenInput.isQuoteValue
        ? TRADE_TYPE.EXACT_OUT
        : TRADE_TYPE.EXACT_IN;

      setTradeType(newTradeType);

      const exactInWithValue =
        newTradeType === TRADE_TYPE.EXACT_IN && newTopTokenInput.value !== "0";
      const exactOutWithValue =
        newTradeType === TRADE_TYPE.EXACT_OUT &&
        newBottomTokenInput.value !== "0";

      if (exactInWithValue || exactOutWithValue) {
        debouncedGetQuoteRef.current(
          newTradeType,
          newTopTokenInput,
          newBottomTokenInput,
          inputId,
        );
      }
    },
    [setError, inputOne, inputTwo, flipTokens, cancelGetQuote],
  );

  const handleTokenSelect = useCallback(
    (
      selectedToken: EvmCurrency,
      oppositeTokenInput: TokenInputState,
      inputId: InputId,
    ) => {
      setError(undefined);

      // we won't have up-to-date inputs after setting them in state,
      // so calculate them here so we can use them to get the quote
      let newInputOne = inputOne;
      let newInputTwo = inputTwo;

      if (inputId === InputId.INPUT_0) {
        newInputOne = { ...inputOne, token: selectedToken };
        setInputOne(newInputOne);
      } else if (inputId === InputId.INPUT_1) {
        newInputTwo = { ...inputTwo, token: selectedToken };
        setInputTwo(newInputTwo);
      }

      if (
        (newInputOne.token?.isNative && newInputTwo.token?.isWrappedNative) ||
        (newInputOne.token?.isWrappedNative && newInputTwo.token?.isNative)
      ) {
        handleWhenNativeAndWrapped(oppositeTokenInput.value);
        // we don't need to get a quote if we're wrapping/unwrapping,
        // so we can return early
        return;
      }

      // these won't have been recalculated yet, so calculate them here to use in the quote
      const newTopTokenInput = flipTokens ? newInputTwo : newInputOne;
      const newBottomTokenInput = flipTokens ? newInputOne : newInputTwo;

      const exactInWithValue =
        tradeType === TRADE_TYPE.EXACT_IN && newTopTokenInput.value !== "0";
      const exactOutWithValue =
        tradeType === TRADE_TYPE.EXACT_OUT && newBottomTokenInput.value !== "0";

      if (exactInWithValue || exactOutWithValue) {
        getQuote(tradeType, newTopTokenInput, newBottomTokenInput).then(
          (res) => {
            if (newInputOne.isQuoteValue && res) {
              setInputOne((prev) => ({ ...prev, value: res.quoteDecimals }));
            } else if (newInputTwo.isQuoteValue && res) {
              setInputTwo((prev) => ({ ...prev, value: res.quoteDecimals }));
            }
          },
        );
      }
    },
    [setError, inputOne, inputTwo, flipTokens, tradeType, getQuote],
  );

  // toggle tradeType and flipTokens and get new quote accordingly
  const handleArrowClick = () => {
    const newTradeType = TRADE_TYPE_OPPOSITES[tradeType];
    const newFlipTokens = !flipTokens;

    // determine what the next topToken and bottomToken will be based on the
    // new flipTokens value and use them to get a quote
    const newTopTokenInput = newFlipTokens ? inputTwo : inputOne;
    const newBottomTokenInput = newFlipTokens ? inputOne : inputTwo;

    setTradeType(newTradeType);
    setFlipTokens(newFlipTokens);

    if (newTopTokenInput.value !== "" || newBottomTokenInput.value !== "") {
      getQuote(newTradeType, newTopTokenInput, newBottomTokenInput).then(
        (res) => {
          if (inputOne.isQuoteValue && res) {
            setInputOne((prev) => ({ ...prev, value: res.quoteDecimals }));
          } else if (inputTwo.isQuoteValue && res) {
            setInputTwo((prev) => ({ ...prev, value: res.quoteDecimals }));
          }
        },
      );
    }
  };

  const handleCloseModal = useCallback(() => {
    setIsConfirmationModalOpen(false);
    if (
      status === TransactionStatus.SUCCESS ||
      status === TransactionStatus.IDLE ||
      status === TransactionStatus.FAILED
    ) {
      handleResetInputs();
    }
  }, [handleResetInputs, status]);

  const handleOpenConfirmationModal = useCallback(() => {
    if (tokenApprovalNeeded) {
      onSubmit();
      return;
    }

    setIsConfirmationModalOpen(true);

    if (isTiaWtia) {
      onSubmit();
    } else {
      setStatus(TransactionStatus.IDLE);
    }
  }, [isTiaWtia, tokenApprovalNeeded, onSubmit, setStatus]);

  const handleSubmit = useCallback(() => {
    if (status !== TransactionStatus.IDLE) {
      handleCloseModal();
    } else {
      onSubmit();
    }
  }, [handleCloseModal, onSubmit, status]);

  return (
    <section>
      <div className="relative flex flex-col items-center">
        <div className="flex flex-col w-full">
          <motion.div
            layout
            transition={SWAP_BUTTON_TRANSITION}
            key={flipTokens ? InputId.INPUT_1 : InputId.INPUT_0}
          >
            <SwapInput
              availableTokens={currencies}
              balance={swapPairs[0].balance}
              id={swapPairs[0].id}
              inputToken={swapPairs[0].inputToken}
              label={swapPairs[0].label}
              onInputChange={handleInputChange}
              onTokenSelect={handleTokenSelect}
              oppositeToken={swapPairs[0].oppositeToken}
              isQuoteLoading={loading}
              isBalanceLoading={isLoadingToken0Balance}
            />
          </motion.div>
          <SwapButton onClick={handleArrowClick} />
          <motion.div
            layout
            transition={SWAP_BUTTON_TRANSITION}
            key={flipTokens ? InputId.INPUT_0 : InputId.INPUT_1}
          >
            <SwapInput
              availableTokens={currencies}
              balance={swapPairs[1].balance}
              id={swapPairs[1].id}
              inputToken={swapPairs[1].inputToken}
              label={swapPairs[1].label}
              onInputChange={handleInputChange}
              onTokenSelect={handleTokenSelect}
              oppositeToken={swapPairs[1].oppositeToken}
              isQuoteLoading={loading}
              isBalanceLoading={isLoadingToken1Balance}
            />
          </motion.div>
        </div>
      </div>
      <ConfirmationModal
        title={title}
        open={isConfirmationModalOpen}
        onOpenChange={handleCloseModal}
      >
        {token0.token && token1.token && (
          <TransactionSummary
            type={TransactionType.SWAP}
            token0={token0.token}
            token1={token1.token}
            hash={hash}
            status={status}
            error={error}
            onSubmit={handleSubmit}
            action={action}
            fee={info.gasUseEstimateUSD}
            amountOut={info.expectedOutputFormatted}
            amountMin={info.minimumReceived}
            amount0={token0.value}
            amount1={token1.value}
            priceImpact={info.priceImpact}
            frontendFeeEstimate={info.frontendFeeEstimate}
          />
        )}
      </ConfirmationModal>
      <Button
        onClick={handleOpenConfirmationModal}
        className="w-full mt-8"
        disabled={!isValid || oneToOneQuote.oneToOneLoading}
      >
        {buttonText}
      </Button>
      {inputOne.token && inputTwo.token && !isTiaWtia && isValid && quote && (
        <TransactionInfo
          info={info}
          token0={token0}
          token1={token1}
          oneToOneQuote={oneToOneQuote}
          quote={quote}
        />
      )}
    </section>
  );
};
