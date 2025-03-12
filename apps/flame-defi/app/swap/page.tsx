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
import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
import { useEvmChainData } from "config";
import { ArrowDownIcon } from "@repo/ui/icons";
import { ActionButton } from "@repo/ui/components";
import {
  EvmCurrency,
  TokenInputState,
  TRADE_TYPE,
  TRADE_TYPE_OPPOSITES,
  TXN_STATUS,
} from "@repo/flame-types";
import { useGetQuote } from "../hooks";
import { useOneToOneQuote, useSwapButton, useTxnInfo } from "./hooks";
import { SwapInput, SwapTxnSteps, TxnInfo } from "./components";
import { useTokenBalances } from "features/evm-wallet";
import debounce from "lodash.debounce";
import { SwapPairProps, TOKEN_INPUTS } from "./types";

export default function SwapPage(): React.ReactElement {
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;
  const userAccount = useAccount();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [inputOne, setInputOne] = useState<TokenInputState>({
    token: currencies?.[0],
    value: "",
    isQuoteValue: false,
  });
  const [inputTwo, setInputTwo] = useState<TokenInputState>({
    token: null,
    value: "",
    isQuoteValue: true,
  });

  const isTiaWtia = useMemo(() => {
    return Boolean(
      (inputOne.token?.isNative && inputTwo.token?.isWrappedNative) ||
        (inputOne.token?.isWrappedNative && inputTwo.token?.isNative),
    );
  }, [inputOne.token, inputTwo.token]);

  const [flipTokens, setFlipTokens] = useState(false);
  const [tradeType, setTradeType] = useState<TRADE_TYPE>(TRADE_TYPE.EXACT_IN);
  const { quote, loading, quoteError, getQuote, setQuote, cancelGetQuote } =
    useGetQuote();

  const { balances, fetchBalances } = useTokenBalances(
    userAccount.address,
    selectedChain,
  );

  const swapInputs: SwapPairProps[] = [
    {
      id: TOKEN_INPUTS.INPUT_ONE,
      inputToken: inputOne,
      oppositeToken: inputTwo,
      balance: balances[0]?.value || "0",
      label: flipTokens ? "Buy" : "Sell",
    },
    {
      id: TOKEN_INPUTS.INPUT_TWO,
      inputToken: inputTwo,
      oppositeToken: inputOne,
      balance: balances[1]?.value || "0",
      label: flipTokens ? "Sell" : "Buy",
    },
  ];

  const swapPairs = (flipTokens ? swapInputs.reverse() : swapInputs) as [
    SwapPairProps,
    SwapPairProps,
  ];
  const topToken = swapPairs[0].inputToken;
  const bottomToken = swapPairs[1].inputToken;

  useEffect(() => {
    if (userAccount.address && (inputOne.token || inputTwo.token)) {
      fetchBalances([inputOne.token, inputTwo.token]);
    }
  }, [userAccount.address, inputOne.token, inputTwo.token, fetchBalances]);

  const oneToOneQuote = useOneToOneQuote(inputOne.token, inputTwo.token);
  const topTokenBalance =
    balances.find((balance) => balance.symbol === topToken.token?.coinDenom)
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
    tokenApprovalNeeded,
    errorText,
    setErrorText,
  } = useSwapButton({
    topToken,
    bottomToken,
    topTokenBalance,
    quote,
    loading,
    quoteError,
    tradeType,
  });
  const txnInfo = useTxnInfo({
    quote,
    topToken,
    bottomToken,
    tradeType,
    validSwapInputs: validSwapInputs,
  });

  const debouncedGetQuoteRef = useRef(
    debounce(
      (
        tradeType: TRADE_TYPE,
        tokenIn: TokenInputState,
        tokenOut: TokenInputState,
        tokenInput: TOKEN_INPUTS,
      ) => {
        getQuote(tradeType, tokenIn, tokenOut).then((res) => {
          if (tokenInput === TOKEN_INPUTS.INPUT_ONE && res) {
            setInputTwo((prev) => ({
              ...prev,
              value: res.quoteDecimals,
              isQuoteValue: true,
            }));
          } else if (tokenInput === TOKEN_INPUTS.INPUT_TWO && res) {
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
    setInputOne({ token: topToken.token, value: "", isQuoteValue: false });
    setInputTwo({ token: bottomToken.token, value: "", isQuoteValue: true });
    setQuote(null);
    setFlipTokens(false);
    setTxnStatus(undefined);
  }, [setQuote, setTxnStatus, topToken, bottomToken]);

  const handleInputChange = useCallback(
    (value: string, tokenInput: TOKEN_INPUTS) => {
      setErrorText(null);

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

      if (tokenInput === TOKEN_INPUTS.INPUT_ONE) {
        newInputOne = { ...inputOne, value, isQuoteValue: false };
        // zero out the other input's value and set it as the quoted value when user types in an input
        newInputTwo = { ...inputTwo, value: "", isQuoteValue: true };
        setInputOne(newInputOne);
        setInputTwo(newInputTwo);
      } else if (tokenInput === TOKEN_INPUTS.INPUT_TWO) {
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
          tokenInput,
        );
      }
    },
    [setErrorText, inputOne, inputTwo, flipTokens, cancelGetQuote],
  );

  const handleTokenSelect = useCallback(
    (
      selectedToken: EvmCurrency,
      oppositeTokenInput: TokenInputState,
      tokenInput: TOKEN_INPUTS,
    ) => {
      setErrorText(null);

      // we won't have up-to-date inputs after setting them in state,
      // so calculate them here so we can use them to get the quote
      let newInputOne = inputOne;
      let newInputTwo = inputTwo;

      if (tokenInput === TOKEN_INPUTS.INPUT_ONE) {
        newInputOne = { ...inputOne, token: selectedToken };
        setInputOne(newInputOne);
      } else if (tokenInput === TOKEN_INPUTS.INPUT_TWO) {
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
    [setErrorText, inputOne, inputTwo, flipTokens, tradeType, getQuote],
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
          console.log(res);
          if (inputOne.isQuoteValue && res) {
            setInputOne((prev) => ({ ...prev, value: res.quoteDecimals }));
          } else if (inputTwo.isQuoteValue && res) {
            setInputTwo((prev) => ({ ...prev, value: res.quoteDecimals }));
          }
        },
      );
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    if (
      txnStatus === TXN_STATUS.SUCCESS ||
      txnStatus === undefined ||
      txnStatus === TXN_STATUS.FAILED
    ) {
      handleResetInputs();
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    if (isTiaWtia) {
      onSubmitCallback();
    } else {
      setTxnStatus(TXN_STATUS.IDLE);
    }
  };

  const handleModalActionButton = () => {
    if (txnStatus !== TXN_STATUS.IDLE) {
      handleCloseModal();
    } else {
      onSubmitCallback();
    }
  };

  return (
    <section className="min-h-[calc(100vh-85px-96px)] flex flex-col mt-[100px]">
      <div className="max-w-[550px] w-full mx-auto gradient-container">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-2xl font-medium">Swap</h2>
          <SettingsPopover />
        </div>
        <div className="relative flex flex-col items-center">
          <div className="flex flex-col gap-1 w-full">
            {swapPairs.map(
              ({ id, inputToken, oppositeToken, balance, label }, index) => (
                <SwapInput
                  availableTokens={currencies}
                  balance={balance}
                  id={id}
                  inputToken={inputToken}
                  key={index}
                  label={label}
                  onInputChange={handleInputChange}
                  onTokenSelect={handleTokenSelect}
                  oppositeToken={oppositeToken}
                  txnQuoteLoading={loading}
                />
              ),
            )}
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
        <ConfirmationModal
          open={modalOpen}
          buttonText={buttonText}
          actionButtonText={actionButtonText}
          showOpenButton={Boolean(validSwapInputs && !tokenApprovalNeeded)}
          handleOpenModal={handleOpenModal}
          handleModalActionButton={handleModalActionButton}
          handleCloseModal={handleCloseModal}
          title={titleText}
        >
          <SwapTxnSteps
            txnStatus={txnStatus}
            txnInfo={txnInfo}
            topToken={topToken}
            bottomToken={bottomToken}
            isTiaWtia={isTiaWtia}
            oneToOneQuote={oneToOneQuote}
            txnHash={txnHash}
            txnMsg={txnMsg}
          />
        </ConfirmationModal>
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
              topToken={topToken}
              bottomToken={bottomToken}
              oneToOneQuote={oneToOneQuote}
              quote={quote}
            />
          )}
      </div>
    </section>
  );
}
