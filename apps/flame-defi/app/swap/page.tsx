"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAccount } from "wagmi";
import { SettingsPopover } from "components/settings-popover/settings-popover";
import { useEvmChainData } from "config";
import { ArrowDownIcon } from "@repo/ui/icons";
import { ActionButton } from "@repo/ui/components";
import { EvmCurrency, TokenState, TRADE_TYPE } from "@repo/flame-types";
import {
  useSwapButton,
  useGetQuote,
  useOneToOneQuote,
  useTxnInfo,
} from "./hooks";
import { SwapInput } from "./components/swap-input";
import { TxnInfo } from "./components/txn-info";
import ConfirmationModal from "components/confirmation-modal/confirmation-modal";
import { SwapTxnSteps } from "./components/swap-txn-steps";
import { useTokenBalances } from "features/evm-wallet";
import debounce from "lodash.debounce";

enum TOKEN_INPUTS {
  TOKEN_ONE = "token_one",
  TOKEN_TWO = "token_two",
}

export default function SwapPage(): React.ReactElement {
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;
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
  const isTiaWtia = useMemo(() => {
    return Boolean(
      (inputOne.token?.isNative && inputTwo.token?.isWrappedNative) ||
        (inputOne.token?.isWrappedNative && inputTwo.token?.isNative),
    );
  }, [inputOne, inputTwo]);

  const [flipTokens, setFlipTokens] = useState(false);
  const [tradeType, setTradeType] = useState<TRADE_TYPE>(TRADE_TYPE.EXACT_IN);
  const { quote, loading, quoteError, getQuote, setQuote, cancelGetQuote } =
    useGetQuote();
  const tokenOne = !flipTokens ? inputOne : inputTwo;
  const tokenTwo = !flipTokens ? inputTwo : inputOne;

  const { balances, fetchBalances } = useTokenBalances(
    userAccount.address,
    selectedChain,
  );

  useEffect(() => {
    if (userAccount.address && (inputOne.token || inputTwo.token)) {
      fetchBalances([inputOne.token, inputTwo.token]);
    }
  }, [userAccount.address, inputOne.token, inputTwo.token, fetchBalances]);

  const oneToOneQuote = useOneToOneQuote(inputOne.token, inputTwo.token);
  const tokenOneBalance =
    balances.find((balance) => balance.symbol === tokenOne.token?.coinDenom)
      ?.value || "0";

  const {
    titleText,
    txnHash,
    onSubmitCallback,
    buttonText,
    actionButtonText,
    validSwapInputs,
    txnStatus,
    setTxnStatus,
    txnMsg,
    isCloseModalAction,
    tokenApprovalNeeded,
    errorText,
    setErrorText,
  } = useSwapButton({
    tokenOne,
    tokenTwo,
    tokenOneBalance,
    quote,
    loading,
    quoteError,
    tradeType,
  });
  const txnInfo = useTxnInfo({
    quote,
    tokenOne,
    tokenTwo,
    tradeType,
    validSwapInputs: validSwapInputs || false,
  });

  const debouncedGetQuoteRef = useRef(
    debounce(
      (
        tradeType: TRADE_TYPE,
        tokenData: { token: EvmCurrency; value: string },
        token: TokenState,
        tokenInput: TOKEN_INPUTS,
      ) => {
        getQuote(tradeType, tokenData, token).then((res) => {
          if (tokenInput === TOKEN_INPUTS.TOKEN_ONE && res) {
            setInputTwo((prev) => ({
              ...prev,
              value: res.quoteDecimals,
              isQuoteValue: true,
            }));
          } else if (tokenInput === TOKEN_INPUTS.TOKEN_TWO && res) {
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

  const handleTradeType = useCallback((index: number) => {
    if (index === 0) {
      setTradeType(TRADE_TYPE.EXACT_IN);
    } else if (index === 1) {
      setTradeType(TRADE_TYPE.EXACT_OUT);
    }
  }, []);

  const handleTiaWtiaInputs = (value: string) => {
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
        handleTiaWtiaInputs(value);
        return;
      }
      setErrorText(null);
      handleTradeType(index);

      const tradeType =
        index === 0 ? TRADE_TYPE.EXACT_IN : TRADE_TYPE.EXACT_OUT;

      if (tokenInput === TOKEN_INPUTS.TOKEN_ONE) {
        setInputOne((prev) => ({ ...prev, value: value, isQuoteValue: false }));
        setInputTwo((prev) => ({ ...prev, value: "", isQuoteValue: true }));
      } else if (tokenInput === TOKEN_INPUTS.TOKEN_TWO) {
        setInputTwo((prev) => ({ ...prev, value: value, isQuoteValue: false }));
        setInputOne((prev) => ({ ...prev, value: "", isQuoteValue: true }));
      }

      if (
        value !== "" &&
        parseFloat(value) > 0 &&
        tokenOne.token &&
        tokenTwo.token
      ) {
        debouncedGetQuoteRef.current(
          tradeType,
          { token: tokenOne.token, value },
          tokenTwo,
          tokenInput,
        );
      }

      if (value === "" || value === "0") {
        setInputOne((prev) => ({ ...prev, value: value }));
        setInputTwo((prev) => ({ ...prev, value: value }));
        cancelGetQuote();
      }
    },
    [
      tokenOne,
      tokenTwo,
      handleTradeType,
      isTiaWtia,
      debouncedGetQuoteRef,
      cancelGetQuote,
      setErrorText,
    ],
  );

  const handleTokenSelect = useCallback(
    (selectedToken: EvmCurrency, tokenInput: TOKEN_INPUTS, index: number) => {
      if (tokenInput === TOKEN_INPUTS.TOKEN_ONE) {
        setInputOne((prev) => ({ ...prev, token: selectedToken }));
      } else if (tokenInput === TOKEN_INPUTS.TOKEN_TWO) {
        setInputTwo((prev) => ({ ...prev, token: selectedToken }));
      }
      setErrorText(null);
      const tradeType = tokenTwo.isQuoteValue
        ? TRADE_TYPE.EXACT_IN
        : TRADE_TYPE.EXACT_OUT;
      const exactInToken = index === 0 ? selectedToken : tokenOne.token;
      const userInputAmount = !tokenOne.isQuoteValue
        ? tokenOne.value
        : tokenTwo.value;
      const exactOutToken =
        index === 0 && tokenTwo.token ? tokenTwo.token : selectedToken;

      if (
        userInputAmount !== "" &&
        parseFloat(userInputAmount) > 0 &&
        tokenOne.token &&
        exactInToken &&
        exactOutToken
      ) {
        getQuote(
          tradeType,
          { token: exactInToken, value: userInputAmount },
          { token: exactOutToken, value: "" },
        ).then((res) => {
          if (tokenOne.isQuoteValue && res) {
            setInputOne((prev) => ({ ...prev, value: res.quoteDecimals }));
          } else if (tokenTwo.isQuoteValue && res) {
            setInputTwo((prev) => ({ ...prev, value: res.quoteDecimals }));
          }
        });
      }
    },
    [getQuote, tokenOne, tokenTwo, setErrorText],
  );

  const handleArrowClick = () => {
    const newTradeType =
      tradeType === TRADE_TYPE.EXACT_IN
        ? TRADE_TYPE.EXACT_OUT
        : TRADE_TYPE.EXACT_IN;
    setFlipTokens((prev) => !prev);
    setTradeType(newTradeType);

    const preFlipTokenOne = !flipTokens ? inputTwo : inputOne;
    const preFlipTokenTwo = !flipTokens ? inputOne : inputTwo;

    if (preFlipTokenOne.value !== "" || preFlipTokenTwo.value !== "") {
      getQuote(newTradeType, preFlipTokenOne, preFlipTokenTwo);
    }
  };

  const swapInputs = [
    {
      id: TOKEN_INPUTS.TOKEN_ONE,
      inputToken: inputOne,
      onInputChange: (value: string, index: number) =>
        handleInputChange(value, TOKEN_INPUTS.TOKEN_ONE, index),
      availableTokens: currencies,
      oppositeToken: inputTwo,
      balance: balances[0]?.value || "0",
      onTokenSelect: (token: EvmCurrency, index: number) =>
        handleTokenSelect(token, TOKEN_INPUTS.TOKEN_ONE, index),
      label: flipTokens ? "Buy" : "Sell",
      txnQuoteData: quote,
      txnQuoteLoading: loading,
      txnQuoteError: quoteError,
    },
    {
      id: TOKEN_INPUTS.TOKEN_TWO,
      inputToken: inputTwo,
      onInputChange: (value: string, index: number) =>
        handleInputChange(value, TOKEN_INPUTS.TOKEN_TWO, index),
      availableTokens: currencies,
      oppositeToken: inputOne,
      balance: balances[1]?.value || "0",
      onTokenSelect: (token: EvmCurrency, index: number) =>
        handleTokenSelect(token, TOKEN_INPUTS.TOKEN_TWO, index),
      label: flipTokens ? "Sell" : "Buy",
      txnQuoteData: quote,
      txnQuoteLoading: loading,
      txnQuoteError: quoteError,
    },
  ];

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
              <ArrowDownIcon aria-label="Swap" size={28} />
            </button>
          </div>
        </div>
        {userAccount.address && !validSwapInputs && !tokenApprovalNeeded && (
          <div className="flex items-center justify-center text-grey-light font-semibold px-4 py-3 rounded-xl bg-semi-white mt-2">
            {buttonText}
          </div>
        )}
        {validSwapInputs && !tokenApprovalNeeded && (
          <ConfirmationModal
            onSubmitCallback={onSubmitCallback}
            buttonText={buttonText}
            actionButtonText={actionButtonText}
            txnStatus={txnStatus}
            setTxnStatus={setTxnStatus}
            isCloseModalAction={isCloseModalAction}
            handleResetInputs={handleResetInputs}
            skipIdleTxnStatus={isTiaWtia}
            title={titleText}
          >
            <SwapTxnSteps
              txnStatus={txnStatus}
              txnInfo={txnInfo}
              tokenOne={tokenOne}
              tokenTwo={tokenTwo}
              isTiaWtia={isTiaWtia}
              oneToOneQuote={oneToOneQuote}
              txnHash={txnHash}
              txnMsg={txnMsg}
            />
          </ConfirmationModal>
        )}
        {(!userAccount.address || tokenApprovalNeeded) && (
          <ActionButton
            callback={onSubmitCallback}
            buttonText={buttonText}
            className="w-full mt-2"
          />
        )}
        {errorText && (
          <div className="flex items-center justify-center text-red text-sm mt-4">
            {errorText}
          </div>
        )}
        {inputOne.token &&
          inputTwo.token &&
          !isTiaWtia &&
          validSwapInputs &&
          quote && (
            <TxnInfo
              txnInfo={txnInfo}
              tokenTwo={tokenTwo}
              oneToOneQuote={oneToOneQuote}
            />
          )}
      </div>
    </section>
  );
}
