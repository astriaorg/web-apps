"use client";

import React, { useCallback, useEffect } from "react";
import { DownArrowIcon } from "@repo/ui/icons";
import { ActionButton, SettingsPopover } from "@repo/ui/components";
import { useState } from "react";
import { useAccount } from "wagmi";
import { TOKEN_INPUTS } from "../constants";
import { TokenState, EvmCurrency } from "@repo/ui/types";
import { useConfig } from "config";
import { useTokenBalance } from "features/EvmWallet/hooks/useTokenBalance";
import { useSwapButton } from "./useSwapButton";
import useGetQuote from "./useGetQuote";
import { SwapInput } from "./components/SwapInput";

export default function SwapPage(): React.ReactElement {
  const { evmChains } = useConfig();
  const evmChainsData = Object.values(evmChains);
  const currencies = evmChainsData[0]?.currencies;
  const userAccount = useAccount();
  const [argumentToken, setArgumentToken] = useState<string>(
    TOKEN_INPUTS.TOKEN_ONE,
  );
  const [inputOne, setInputOne] = useState<TokenState>({
    token: currencies?.[0],
    value: "",
  });
  const [inputTwo, setInputTwo] = useState<TokenState>({
    token: null,
    value: "",
  });
  const [flipTokens, setFlipTokens] = useState(false);
  const isTiaWtia =
    (inputOne.token?.coinDenom === "TIA" &&
      inputTwo.token?.coinDenom === "WTIA") ||
    (inputOne.token?.coinDenom === "WTIA" &&
      inputTwo.token?.coinDenom === "TIA");

  const { quote, loading, error } = useGetQuote(
    evmChainsData[0]?.chainId,
    argumentToken === TOKEN_INPUTS.TOKEN_ONE ? inputOne : inputTwo,
    argumentToken === TOKEN_INPUTS.TOKEN_ONE ? inputTwo : inputOne,
  );

  const { handleButtonAction, buttonText, validSwapInputs } = useSwapButton({
    inputOne: flipTokens ? inputTwo : inputOne,
    inputTwo: flipTokens ? inputOne : inputTwo,
    tokenOneBalance:
      useTokenBalance(
        flipTokens ? inputTwo.token : inputOne.token,
        evmChainsData[0],
      ).balance?.value || "0",
    evmChainsData,
    quote,
    loading,
    error,
  });

  const handleTiaWtia = (value: string) => {
    setInputOne((prev) => ({ ...prev, value: value }));
    setInputTwo((prev) => ({ ...prev, value: value }));
  };

  const handleInputChange = useCallback(
    (
      value: string,
      setInput: React.Dispatch<React.SetStateAction<TokenState>>,
      setOppositeInput: React.Dispatch<React.SetStateAction<TokenState>>,
      currentInput: string,
    ) => {
      setArgumentToken(currentInput);
      if (isTiaWtia) {
        handleTiaWtia(value);
      } else {
        setInput((prev) => ({ ...prev, value: value }));
        if (value === "" || value === "0") {
          setOppositeInput((prev) => ({ ...prev, value: "" }));
        }
      }
    },
    [isTiaWtia],
  );

  useEffect(() => {
    // NOTE: This is needed because the useGetQuote hook does not return values for TIA/WTIA since they are the same
    const value = inputOne.value || inputTwo.value;
    if (isTiaWtia) {
      handleTiaWtia(value);
    }
  }, [isTiaWtia, inputOne.value, inputTwo.value]);

  useEffect(() => {
    if (quote?.quoteDecimals && !isTiaWtia) {
      if (argumentToken === TOKEN_INPUTS.TOKEN_ONE && inputOne.value !== "") {
        setInputTwo((prev) => ({ ...prev, value: quote.quoteDecimals }));
      } else if (
        argumentToken === TOKEN_INPUTS.TOKEN_TWO &&
        inputTwo.value !== ""
      ) {
        setInputOne((prev) => ({ ...prev, value: quote.quoteDecimals }));
      }
    }
  }, [inputOne.value, inputTwo.value, quote, argumentToken, isTiaWtia]);

  const swapInputs = [
    {
      inputValue: inputOne,
      onInputChange: (value: string) =>
        handleInputChange(
          value,
          setInputOne,
          setInputTwo,
          TOKEN_INPUTS.TOKEN_ONE,
        ),
      availableTokens: currencies,
      selectedToken: inputOne.token,
      oppositeToken: inputTwo.token,
      onTokenSelect: (token: EvmCurrency) => setInputOne({ value: "", token }),
      balance: useTokenBalance(inputOne.token, evmChainsData[0]).balance,
      label: flipTokens ? "Buy" : "Sell",
    },
    {
      inputValue: inputTwo,
      onInputChange: (value: string) =>
        handleInputChange(
          value,
          setInputTwo,
          setInputOne,
          TOKEN_INPUTS.TOKEN_TWO,
        ),
      availableTokens: currencies,
      selectedToken: inputTwo.token,
      oppositeToken: inputOne.token,
      onTokenSelect: (token: EvmCurrency) => setInputTwo({ value: "", token }),
      balance: useTokenBalance(inputTwo.token, evmChainsData[0]).balance,
      label: flipTokens ? "Sell" : "Buy",
    },
  ];

  const handleArrowClick = () => {
    setFlipTokens((prev) => !prev);
  };

  // TODO:
  // TokenOne = TokenTwo with tooltip. On click swaps direction

  return (
    <section className="min-h-[calc(100vh-85px-96px)] flex flex-col mt-[100px]">
      <div className="max-w-[550px] w-full mx-auto gradient-container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-2xl font-medium">Swap</h2>
          <SettingsPopover />
        </div>
        <div className="relative flex flex-col items-center">
          <div className="flex flex-col gap-1 w-full">
            {(flipTokens ? swapInputs.reverse() : swapInputs).map(
              (props, index) => (
                <SwapInput key={index} {...props} />
              ),
            )}
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
        {handleButtonAction && validSwapInputs && (
          <ActionButton
            callback={handleButtonAction}
            buttonText={buttonText}
            className="w-full mt-2"
          />
        )}
        {handleButtonAction && !userAccount.address && (
          <ActionButton
            callback={handleButtonAction}
            buttonText={buttonText}
            className="w-full mt-2"
          />
        )}
        {/* TODO: ADD THIS IN WHEN WE HAVE THE TXN INFO */}
        {/* {inputOne && inputTwo && <TxnInfo inputOne={inputOne} inputTwo={inputTwo}/>} */}
      </div>
    </section>
  );
}
