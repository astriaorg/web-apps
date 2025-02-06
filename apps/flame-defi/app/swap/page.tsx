"use client";

import React, { useCallback, useEffect } from "react";
import { DownArrowIcon } from "@repo/ui/icons";
import { ActionButton } from "@repo/ui/components";
import { useState } from "react";
import { useAccount } from "wagmi";
import { QUOTE_TYPE, TOKEN_INPUTS } from "../constants";
import { TokenState, EvmCurrency } from "@repo/ui/types";
import { useEvmChainData } from "config";
import { useTokenBalance } from "features/EvmWallet/hooks/useTokenBalance";
import { useSwapButton } from "./useSwapButton";
import { SwapInput } from "./components/SwapInput";
import { TxnInfo } from "./components/TxnInfo";
import ConfirmationModal from "components/ConfirmationModal/ConfirmationModal";
import { SwapTxnSteps } from "./components/SwapTxnSteps";
import { useGetQuote } from "./useGetQuote";
import { SettingsPopover } from "components/SettingsPopover/SettingsPopover";


export const isTiaWtiaSwapPair = (
  inputOne: TokenState,
  inputTwo: TokenState
) => {
  const isTiaWtia =
    (inputOne.token?.coinDenom === "TIA" &&
      inputTwo.token?.coinDenom === "WTIA") ||
    (inputOne.token?.coinDenom === "WTIA" &&
      inputTwo.token?.coinDenom === "TIA");

  return isTiaWtia;
};

export default function SwapPage(): React.ReactElement {
  const { currencies, evmChainsData } = useEvmChainData();
  const userAccount = useAccount();
  const [inputOne, setInputOne] = useState<TokenState>({
    token: currencies?.[0],
    value: "",
    isQuoteValue: false,
  });
  const [inputTwo, setInputTwo] = useState<TokenState>({
    token: null,
    value: "",
    isQuoteValue: true,
  });
  const isTiaWtia = isTiaWtiaSwapPair(inputOne, inputTwo);
  const [flipTokens, setFlipTokens] = useState(false);
  const [quoteType, setQuoteType] = useState<QUOTE_TYPE>(QUOTE_TYPE.EXACT_IN);
  const { quote, loading, error, getQuote, setQuote } = useGetQuote();
  const tokenOne = !flipTokens ? inputOne : inputTwo;
  const tokenTwo = !flipTokens ? inputTwo : inputOne;
  const tokenOneBalance =
    useTokenBalance(tokenOne.token, evmChainsData).balance?.value || "0";

  const {
    onSubmitCallback,
    buttonText,
    actionButtonText,
    validSwapInputs,
    txnStatus,
    setTxnStatus,
    isCloseModalAction,
  } = useSwapButton({
    tokenOne,
    tokenTwo,
    tokenOneBalance: tokenOneBalance,
    quote,
    loading,
    error,
    quoteType,
  });

  const handleQuoteType = useCallback((index: number) => {
    if (index === 0) {
      setQuoteType(QUOTE_TYPE.EXACT_IN);
    } else if (index === 1) {
      setQuoteType(QUOTE_TYPE.EXACT_OUT);
    }
  }, []);

  const handleTiaWtia = (value: string) => {
    setInputOne((prev) => ({ ...prev, value: value }));
    setInputTwo((prev) => ({ ...prev, value: value }));
  };

  const handleResetInputs = useCallback(() => {
    setInputOne({ token: currencies?.[0], value: "", isQuoteValue: false });
    setInputTwo({ token: null, value: "", isQuoteValue: true });
    setQuote(null);
    setFlipTokens(false);
  }, [currencies, setQuote]);

  const handleInputChange = useCallback(
    (value: string, tokenInput: TOKEN_INPUTS, index: number) => {
      if (isTiaWtia) {
        handleTiaWtia(value);
        return;
      }

      handleQuoteType(index);
      const quoteType =
        index === 0 ? QUOTE_TYPE.EXACT_IN : QUOTE_TYPE.EXACT_OUT;

      if (tokenInput === TOKEN_INPUTS.TOKEN_ONE) {
        setInputOne((prev) => ({ ...prev, value: value, isQuoteValue: false }));
        setInputTwo((prev) => ({ ...prev, value: "", isQuoteValue: true }));
      } else if (tokenInput === TOKEN_INPUTS.TOKEN_TWO) {
        setInputTwo((prev) => ({ ...prev, value: value, isQuoteValue: false }));
        setInputOne((prev) => ({ ...prev, value: "", isQuoteValue: true }));
      }

      if (tokenOne.value && tokenTwo.value) {
        getQuote(quoteType, { token: tokenOne.token, value: value }, tokenTwo);
      }

      if (value === "" || value === "0") {
        handleResetInputs();
      }
    },
    [
      tokenOne,
      tokenTwo,
      getQuote,
      handleResetInputs,
      handleQuoteType,
      isTiaWtia,
    ]
  );

  useEffect(() => {
    if (
      tokenOne.token &&
      tokenTwo.token &&
      !tokenTwo.value &&
      tokenTwo.isQuoteValue
    ) {
      getQuote(quoteType, tokenOne, tokenTwo);
    }
    if (
      tokenOne.token &&
      tokenTwo.token &&
      !tokenOne.value &&
      tokenOne.isQuoteValue
    ) {
      getQuote(quoteType, tokenOne, tokenTwo);
    }
  }, [quoteType, tokenOne, tokenTwo, getQuote]);


  useEffect(() => {
    if (quote?.quoteDecimals && inputOne.isQuoteValue) {
      setInputOne((prev) => ({ ...prev, value: quote.quoteDecimals }));
    } else if (quote?.quoteDecimals && inputTwo.isQuoteValue) {
      setInputTwo((prev) => ({ ...prev, value: quote.quoteDecimals }));
    }
  }, [quote, inputOne.isQuoteValue, inputTwo.isQuoteValue]);


  const swapInputs = [
    {
      id: TOKEN_INPUTS.TOKEN_ONE,
      inputToken: inputOne,
      onInputChange: (value: string, index: number) =>
        handleInputChange(value, TOKEN_INPUTS.TOKEN_ONE, index),
      availableTokens: currencies,
      oppositeToken: inputTwo,
      balance: useTokenBalance(inputOne.token, evmChainsData).balance,
      onTokenSelect: (token: EvmCurrency) =>
        setInputOne((prev) => ({ ...prev, value: "", token })),
      label: flipTokens ? "Buy" : "Sell",
      txnQuoteData: quote,
      txnQuoteLoading: loading,
      txnQuoteError: error,
    },
    {
      id: TOKEN_INPUTS.TOKEN_TWO,
      inputToken: inputTwo,
      onInputChange: (value: string, index: number) =>
        handleInputChange(value, TOKEN_INPUTS.TOKEN_TWO, index),
      availableTokens: currencies,
      oppositeToken: inputOne,
      balance: useTokenBalance(inputTwo.token, evmChainsData).balance,
      onTokenSelect: (token: EvmCurrency) =>
        setInputTwo((prev) => ({ ...prev, value: "", token })),
      label: flipTokens ? "Sell" : "Buy",
      txnQuoteData: quote,
      txnQuoteLoading: loading,
      txnQuoteError: error,
    },
  ];

  const handleArrowClick = () => {
    setFlipTokens((prev) => !prev);
    setInputOne((prev) => ({ ...prev, isQuoteValue: !prev.isQuoteValue }));
    setInputTwo((prev) => ({ ...prev, isQuoteValue: !prev.isQuoteValue }));

    const preFlipTokenOne = !flipTokens ? inputTwo : inputOne;
    const preFlipTokenTwo = !flipTokens ? inputOne : inputTwo;
    getQuote(QUOTE_TYPE.EXACT_IN, preFlipTokenOne, preFlipTokenTwo);
  };

  const swapPairs = flipTokens ? swapInputs.reverse() : swapInputs;

  return (
    <section className="min-h-[calc(100vh-85px-96px)] flex flex-col mt-[100px]">
      <div className="max-w-[550px] w-full mx-auto gradient-container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-2xl font-medium">Swap</h2>
          <SettingsPopover />
        </div>
        <div className="relative flex flex-col items-center">
          <div className="flex flex-col gap-1 w-full">
            {swapPairs.map((props, index) => (
              <SwapInput key={index} {...props} index={index} />
            ))}
          </div>
          <div className="absolute top-1/2 transform -translate-y-1/2 flex justify-center">
            <button
              type="button"
              className="z-10 cursor-pointer p-1 bg-grey-dark hover:bg-black transition rounded-xl border-4 border-black"
              onClick={handleArrowClick}
            >
              <DownArrowIcon aria-label="Swap" size={28} />
            </button>
          </div>
        </div>
        {userAccount.address && !validSwapInputs && (
          <div className="flex items-center justify-center text-grey-light font-semibold px-4 py-3 rounded-xl bg-semi-white mt-2">
            {buttonText}
          </div>
        )}
        {onSubmitCallback && validSwapInputs && (
          <ConfirmationModal
            onSubmitCallback={onSubmitCallback}
            buttonText={buttonText}
            actionButtonText={actionButtonText}
            txnStatus={txnStatus}
            setTxnStatus={setTxnStatus}
            isCloseModalAction={isCloseModalAction}
            handleResetInputs={handleResetInputs}
            skipIdleTxnStatus={isTiaWtia}
            title="Confirm Swap"
          >
            <SwapTxnSteps
              txnStatus={txnStatus}
              swapPairs={swapPairs}
              isTiaWtia={isTiaWtia}
            />
          </ConfirmationModal>
        )}
        {onSubmitCallback && !userAccount.address && (
          <ActionButton
            callback={onSubmitCallback}
            buttonText={buttonText}
            className="w-full mt-2"
          />
        )}
        {inputOne.token && inputTwo.token && !isTiaWtia && validSwapInputs && (
          <TxnInfo swapPairs={swapPairs} />
        )}
      </div>
    </section>
  );
}
