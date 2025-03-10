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
  TokenState,
  TRADE_TYPE,
  TXN_STATUS,
} from "@repo/flame-types";
import { useGetQuote } from "../hooks";
import { useSwapButton, useOneToOneQuote, useTxnInfo } from "./hooks";
import { SwapTxnSteps, SwapInput, TxnInfo } from "./components";
import { useTokenBalances } from "features/evm-wallet";
import debounce from "lodash.debounce";
import { TOKEN_INPUTS, SwapPairProps } from "./types";

export default function SwapPage(): React.ReactElement {
  const { selectedChain } = useEvmChainData();
  const { currencies } = selectedChain;
  const userAccount = useAccount();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
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
      label: flipTokens ? "Sell" : "Buy",
    },
    {
      id: TOKEN_INPUTS.INPUT_TWO,
      inputToken: inputTwo,
      oppositeToken: inputOne,
      balance: balances[1]?.value || "0",
      label: flipTokens ? "Buy" : "Sell",
    },
  ];

  const swapPairs = (flipTokens ? swapInputs.reverse() : swapInputs) as [
    SwapPairProps,
    SwapPairProps,
  ];
  const topToken = swapPairs[0].inputToken;
  const bottomToken = swapPairs[1].inputToken;
  const userInputToken = !topToken.isQuoteValue ? topToken : bottomToken;

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
        tokenData: { token: EvmCurrency; value: string },
        token: TokenState,
        tokenInput: TOKEN_INPUTS,
      ) => {
        getQuote(tradeType, tokenData, token).then((res) => {
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
    setInputOne({ token: topToken.token, value: "", isQuoteValue: false });
    setInputTwo({ token: bottomToken.token, value: "", isQuoteValue: true });
    setQuote(null);
    setFlipTokens(false);
    setTxnStatus(undefined);
  }, [setQuote, setTxnStatus, topToken, bottomToken]);

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

      if (tokenInput === TOKEN_INPUTS.INPUT_ONE) {
        setInputOne((prev) => ({ ...prev, value: value, isQuoteValue: false }));
        setInputTwo((prev) => ({ ...prev, value: "", isQuoteValue: true }));
      } else if (tokenInput === TOKEN_INPUTS.INPUT_TWO) {
        setInputTwo((prev) => ({ ...prev, value: value, isQuoteValue: false }));
        setInputOne((prev) => ({ ...prev, value: "", isQuoteValue: true }));
      }

      if (
        value !== "" &&
        parseFloat(value) > 0 &&
        topToken.token &&
        bottomToken.token
      ) {
        debouncedGetQuoteRef.current(
          tradeType,
          { token: topToken.token, value },
          bottomToken,
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
      topToken,
      bottomToken,
      handleTradeType,
      isTiaWtia,
      debouncedGetQuoteRef,
      cancelGetQuote,
      setErrorText,
    ],
  );

  const handleTokenSelect = useCallback(
    (selectedToken: EvmCurrency, tokenInput: TOKEN_INPUTS, index: number) => {
      const oppositeInputToken =
        tokenInput === TOKEN_INPUTS.INPUT_ONE ? bottomToken : topToken;
      if (
        (selectedToken.isNative && oppositeInputToken.token?.isWrappedNative) ||
        (selectedToken.isWrappedNative && oppositeInputToken.token?.isNative)
      ) {
        const value =
          tokenInput === TOKEN_INPUTS.INPUT_ONE
            ? bottomToken.value
            : topToken.value;
        handleTiaWtiaInputs(value);
      }

      if (tokenInput === TOKEN_INPUTS.INPUT_ONE) {
        setInputOne((prev) => ({ ...prev, token: selectedToken }));
      } else if (tokenInput === TOKEN_INPUTS.INPUT_TWO) {
        setInputTwo((prev) => ({ ...prev, token: selectedToken }));
      }

      setErrorText(null);

      const tradeType = topToken.isQuoteValue
        ? TRADE_TYPE.EXACT_OUT
        : TRADE_TYPE.EXACT_IN;
      const exactInToken = index === 0 ? selectedToken : topToken.token;
      const exactOutToken =
        index === 0 && bottomToken.token ? bottomToken.token : selectedToken;

      if (
        userInputToken.value !== "" &&
        parseFloat(userInputToken.value) > 0 &&
        exactInToken &&
        exactOutToken
      ) {
        getQuote(
          tradeType,
          { token: exactInToken, value: userInputToken.value },
          { token: exactOutToken, value: "" },
        ).then((res) => {
          if (inputOne.isQuoteValue && res) {
            setInputOne((prev) => ({ ...prev, value: res.quoteDecimals }));
          } else if (inputTwo.isQuoteValue && res) {
            setInputTwo((prev) => ({ ...prev, value: res.quoteDecimals }));
          }
        });
      }
    },
    [
      getQuote,
      topToken,
      bottomToken,
      setErrorText,
      userInputToken,
      inputOne,
      inputTwo,
    ],
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
      getQuote(
        newTradeType,
        { token: preFlipTokenOne.token, value: userInputToken.value },
        preFlipTokenTwo,
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
                  index={index}
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
};
