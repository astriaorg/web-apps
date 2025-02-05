"use client";

import React, { useCallback, useEffect } from "react";
import { DownArrowIcon } from "@repo/ui/icons";
import { ActionButton, SettingsPopover } from "@repo/ui/components";
import { useState } from "react";
import { useAccount } from "wagmi";
import { QUOTE_TYPE, TOKEN_INPUTS } from "../constants";
import { TokenState, EvmCurrency, GetQuoteResult } from "@repo/ui/types";
import { useConfig } from "config";
import { useTokenBalance } from "features/EvmWallet/hooks/useTokenBalance";
import { useSwapButton } from "./useSwapButton";
import { getQuote } from "./getQuote";
import { SwapInput } from "./components/SwapInput";
import { TxnInfo } from "./components/TxnInfo";
import { useTxnInfo } from "./useTxnInfo";
import ConfirmationModal from "components/ConfirmationModal/ConfirmationModal";
import { SwapTxnSteps } from "./components/SwapTxnSteps";
import { useGetQuote } from "./useGetQuote";

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
  const { evmChains } = useConfig();
  const evmChainsData = Object.values(evmChains);
  const currencies = evmChainsData[0]?.currencies;
  const userAccount = useAccount();
  const [inputOne, setInputOne] = useState<TokenState>({
    token: currencies?.[0],
    value: "",
    selectedInput: true,
  });
  const [inputTwo, setInputTwo] = useState<TokenState>({
    token: null,
    value: "",
    selectedInput: false,
  });
  const [quoteInput, setQuoteInput] = useState<TokenState>({
    token: null,
    value: "",
  });
  const isTiaWtia = isTiaWtiaSwapPair(inputOne, inputTwo);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [flipTokens, setFlipTokens] = useState(false);
  const [quoteType, setQuoteType] = useState<QUOTE_TYPE>(QUOTE_TYPE.EXACT_IN);
  const { quote, loading, error, getQuote } = useGetQuote();

  // FACTORS:
  // QUOTE TYPE = EXACT_IN or EXACT_OUT
  // FLIP TOKENS = TRUE or FALSE
  // SELECTED INDEX = 0 or 1
  // SELECTED INPUT = TRUE or FALSE

  const {
    onSubmitCallback,
    buttonText,
    actionButtonText,
    validSwapInputs,
    txnStatus,
    setTxnStatus,
    isCloseModalAction,
  } = useSwapButton({
    inputOne,
    inputTwo,
    tokenOneBalance:
      useTokenBalance(
        flipTokens ? inputTwo.token : inputOne.token,
        evmChainsData[0]
      ).balance?.value || "0",
    evmChainsData,
    quote,
    loading,
    error,
    quoteType,
  });

  useEffect(() => {
    const tokenOne = !flipTokens ? inputOne : inputTwo;
    const tokenTwo = !flipTokens ? inputTwo : inputOne;
    if (tokenOne.value || tokenTwo.value) {
      getQuote(quoteType, tokenOne, tokenTwo);
    }
  }, [inputOne, inputTwo, getQuote, quoteType, flipTokens]);

  const handleSelectedInput = (index: number, id: TOKEN_INPUTS) => {
    setSelectedIndex(index);
    if (index === 0) {
      setQuoteType(QUOTE_TYPE.EXACT_IN);
    } else if (index === 1) {
      setQuoteType(QUOTE_TYPE.EXACT_OUT);
    }
    if (id === TOKEN_INPUTS.TOKEN_ONE) {
      setInputOne((prev) => ({ ...prev, selectedInput: true }));
      setInputTwo((prev) => ({ ...prev, selectedInput: false }));
    } else if (id === TOKEN_INPUTS.TOKEN_TWO) {
      setInputOne((prev) => ({ ...prev, selectedInput: false }));
      setInputTwo((prev) => ({ ...prev, selectedInput: true }));
    }
  };

  const handleTiaWtia = (value: string) => {
    setInputOne((prev) => ({ ...prev, value: value }));
    setInputTwo((prev) => ({ ...prev, value: value }));
    setQuoteInput((prev) => ({ ...prev, value: value }));
  };

  const handleResetInputs = () => {
    setInputOne((prev) => ({ ...prev, value: "" }));
    setInputTwo((prev) => ({ ...prev, value: "" }));
    setQuoteInput((prev) => ({ ...prev, value: "" }));
  };

  const handleInputChange = useCallback(
    (
      value: string,
      setInput: React.Dispatch<React.SetStateAction<TokenState>>
    ) => {
      setInput((prev) => ({ ...prev, value: value }));
      if (value === "" || value === "0") {
        setQuoteInput((prev) => ({ ...prev, value: "" }));
      }
    },
    []
  );

  useEffect(() => {
    const value = inputOne.value || inputTwo.value;
    if (isTiaWtia) {
      handleTiaWtia(value);
    }
  }, [isTiaWtia, inputOne.value, inputTwo.value]);

  useEffect(() => {
    if (quote?.quoteDecimals) {
      setQuoteInput((prev) => ({ ...prev, value: quote.quoteDecimals }));
    }
  }, [quote]);

  const swapInputs = [
    {
      id: TOKEN_INPUTS.TOKEN_ONE,
      inputToken: inputOne,
      onInputChange: (value: string) => handleInputChange(value, setInputOne),
      selectedIndex,
      quoteInput,
      availableTokens: currencies,
      oppositeToken: inputTwo,
      onTokenSelect: (token: EvmCurrency) => setInputOne({ value: "", token }),
      onInputClick: (key: number, id: TOKEN_INPUTS) =>
        handleSelectedInput(key, id),
      balance: useTokenBalance(inputOne.token, evmChainsData[0]).balance,
      label: flipTokens ? "Buy" : "Sell",
      txnQuoteData: quote,
      txnQuoteLoading: loading,
      txnQuoteError: error,
    },
    {
      id: TOKEN_INPUTS.TOKEN_TWO,
      inputToken: inputTwo,
      onInputChange: (value: string) => handleInputChange(value, setInputTwo),
      selectedIndex,
      quoteInput,
      availableTokens: currencies,
      oppositeToken: inputOne,
      onTokenSelect: (token: EvmCurrency) => setInputTwo({ value: "", token }),
      onInputClick: (key: number, id: TOKEN_INPUTS) =>
        handleSelectedInput(key, id),
      balance: useTokenBalance(inputTwo.token, evmChainsData[0]).balance,
      label: flipTokens ? "Sell" : "Buy",
      txnQuoteData: quote,
      txnQuoteLoading: loading,
      txnQuoteError: error,
    },
  ];

  const handleArrowClick = () => {
    setFlipTokens((prev) => !prev);
    setInputOne((prev) => ({
      ...prev,
      value: prev.value === "" ? quote?.quoteDecimals || "" : prev.value,
    }));
    setInputTwo((prev) => ({
      ...prev,
      value: prev.value === "" ? quote?.quoteDecimals || "" : prev.value,
    }));
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
            title="Confirm Swap"
          >
            <SwapTxnSteps txnStatus={txnStatus} setTxnStatus={setTxnStatus} swapPairs={swapPairs} isTiaWtia={isTiaWtia}/> 
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
