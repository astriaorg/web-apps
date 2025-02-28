import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useConfig as useWagmiConfig,
  useWaitForTransactionReceipt,
} from "wagmi";

import { useEvmChainData } from "config";
import {
  useEvmWallet,
  createTradeFromQuote,
  createWethService,
  createSwapRouterService,
} from "features/evm-wallet";
import {
  evmChainToRainbowKitChain,
  EvmCurrency,
  GetQuoteResult,
  TokenState,
  tokenStateToBig,
} from "@repo/flame-types";
import { getSwapSlippageTolerance } from "@repo/ui/utils";
import { TRADE_TYPE, TXN_STATUS } from "@repo/flame-types";
import Big from "big.js";
import { Chain } from "viem";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

interface SwapButtonProps {
  tokenOne: TokenState;
  tokenTwo: TokenState;
  tokenOneBalance: string;
  quote: GetQuoteResult | null;
  loading: boolean;
  quoteError: string | null;
  tradeType: TRADE_TYPE;
}

interface ErrorWithMessage {
  message: string;
}

const useCheckTokenApproval = (
  tokenOne: TokenState,
  tokenTwo: TokenState,
): EvmCurrency | null => {
  const { tokenAllowances } = useEvmWallet();
  const tokenOneValueBig = tokenStateToBig(tokenOne);
  const tokenTwoValueBig = tokenStateToBig(tokenTwo);

  const findApproval = (token: TokenState) =>
    tokenAllowances.find(
      (allowanceToken) => allowanceToken.symbol === token?.token?.coinDenom,
    );

  const tokenOneNeedingApproval = tokenOne?.token
    ? findApproval(tokenOne)
    : null;
  const tokenTwoNeedingApproval = tokenTwo?.token
    ? findApproval(tokenTwo)
    : null;

  if (
    tokenOneNeedingApproval &&
    tokenOneValueBig.gt(new Big(tokenOneNeedingApproval.allowance.toString()))
  ) {
    return tokenOne.token || null;
  }
  if (
    tokenTwoNeedingApproval &&
    tokenTwoValueBig.gt(new Big(tokenTwoNeedingApproval.allowance.toString()))
  ) {
    return tokenTwo.token || null;
  }

  return null;
};

export function useSwapButton({
  tokenOne,
  tokenTwo,
  tokenOneBalance,
  quote,
  loading,
  quoteError,
  tradeType,
}: SwapButtonProps) {
  const { selectedChain } = useEvmChainData();
  const { approveToken } = useEvmWallet();
  const wagmiConfig = useWagmiConfig();
  const userAccount = useAccount();
  const slippageTolerance = getSwapSlippageTolerance();
  const addRecentTransaction = useAddRecentTransaction();
  const { connectEvmWallet } = useEvmWallet();
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS | undefined>(undefined);
  const [txnMsg, setTxnMsg] = useState<string | undefined>(undefined);
  const [txnHash, setTxnHash] = useState<`0x${string}` | undefined>(undefined);
  const [errorText, setErrorText] = useState<string | null>(null);
  const result = useWaitForTransactionReceipt({ hash: txnHash });
  const tokenApprovalNeeded = useCheckTokenApproval(tokenOne, tokenTwo);

  const wrapTia = tokenOne?.token?.isNative && tokenTwo?.token?.isWrappedNative;
  const unwrapTia =
    tokenOne?.token?.isWrappedNative && tokenTwo?.token?.isNative;

  const handleTxnModalErrorMsgs = (error?: string, defaultMsg?: string) => {
    if (error?.includes("rejected")) {
      setTxnMsg("Transaction rejected");
    } else if (defaultMsg) {
      setTxnMsg(defaultMsg);
    } else {
      setTxnMsg("Transaction error");
    }
  };

  useEffect(() => {
    if (quoteError) {
      setErrorText(quoteError);
    } else {
      setErrorText(null);
    }
  }, [quoteError]);

  useEffect(() => {
    if (result.data?.status === "success") {
      setTxnStatus(TXN_STATUS.SUCCESS);
      addRecentTransaction({
        hash: txnHash || "",
        description: "Successful transaction",
      });
    } else if (result.data?.status === "reverted") {
      setTxnStatus(TXN_STATUS.FAILED);
      handleTxnModalErrorMsgs("", "Transaction reverted");
    } else if (result.data?.status === "error") {
      setTxnStatus(TXN_STATUS.FAILED);
      handleTxnModalErrorMsgs("", "Transaction failed");
    }
  }, [result.data, txnHash, addRecentTransaction]);

  const handleWrap = async (type: "wrap" | "unwrap") => {
    const wtiaAddress = selectedChain.contracts?.wrappedNativeToken.address;
    if (!selectedChain?.chainId || !wtiaAddress) {
      return;
    }
    setTxnStatus(TXN_STATUS.PENDING);

    const wethService = createWethService(wagmiConfig, wtiaAddress);

    if (type === "wrap") {
      try {
        const tx = await wethService.deposit(
          selectedChain.chainId,
          tokenOne.value,
          tokenOne.token?.coinDecimals || 18,
        );
        setTxnHash(tx);
      } catch (error) {
        const errorMessage =
          (error as ErrorWithMessage).message || "Error unwrapping";
        setTxnStatus(TXN_STATUS.FAILED);
        handleTxnModalErrorMsgs(errorMessage);
      }
    } else {
      try {
        const tx = await wethService.withdraw(
          selectedChain.chainId,
          tokenOne.value,
          tokenOne.token?.coinDecimals || 18,
        );
        setTxnHash(tx);
      } catch (error) {
        const errorMessage =
          (error as ErrorWithMessage).message || "Error unwrapping";
        setTxnStatus(TXN_STATUS.FAILED);
        handleTxnModalErrorMsgs(errorMessage);
      }
    }
  };

  const trade = useMemo(() => {
    if (!quote) {
      return null;
    }
    return createTradeFromQuote(quote, tradeType);
  }, [quote, tradeType]);

  const handleSwap = useCallback(async () => {
    if (!trade || !userAccount.address || !selectedChain?.chainId) {
      return;
    }
    setTxnStatus(TXN_STATUS.PENDING);
    try {
      const swapRouterAddress = selectedChain.contracts?.swapRouter.address;
      if (!swapRouterAddress) {
        console.warn("Swap router address is not defined. Cannot swap.");
        return;
      }

      const swapRouterService = createSwapRouterService(
        wagmiConfig,
        swapRouterAddress as `0x${string}`,
        evmChainToRainbowKitChain(selectedChain) as Chain,
      );

      const options = {
        recipient: userAccount.address,
        slippageTolerance: slippageTolerance,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1800), // 30 minutes from now
        isNativeIn: tokenOne.token?.coinDenom.toLocaleLowerCase() === "tia",
        isNativeOut: tokenTwo.token?.coinDenom.toLocaleLowerCase() === "tia",
      };

      const tx = await swapRouterService.executeSwap(
        selectedChain.chainId,
        trade,
        options,
      );
      setTxnHash(tx);
    } catch (error) {
      const errorMessage =
        (error as ErrorWithMessage).message || "Error executing swap";
      setTxnStatus(TXN_STATUS.FAILED);
      handleTxnModalErrorMsgs(errorMessage);
    }
  }, [
    trade,
    tokenOne.token?.coinDenom,
    tokenTwo.token?.coinDenom,
    userAccount,
    selectedChain,
    wagmiConfig,
    slippageTolerance,
  ]);

  const handleTokenApproval = async (token: EvmCurrency | null) => {
    if (!token) {
      return null;
    }
    try {
      const txHash = await approveToken(token);
      if (txHash) {
        setTxnHash(txHash);
      }
      return txHash;
    } catch (error) {
      console.warn(error);
      setErrorText("Problem approving token");
      return null;
    }
  };

  const validSwapInputs =
    !loading &&
    errorText === null &&
    tokenOne?.token &&
    tokenTwo?.token &&
    tokenOne?.value !== undefined &&
    tokenTwo?.value !== undefined &&
    parseFloat(tokenOne?.value) > 0 &&
    parseFloat(tokenTwo?.value) > 0 &&
    parseFloat(tokenOne?.value) <= parseFloat(tokenOneBalance);

  const onSubmitCallback = () => {
    switch (true) {
      case !userAccount.address:
        return connectEvmWallet();
      case tokenApprovalNeeded !== null:
        return handleTokenApproval(tokenApprovalNeeded);
      case unwrapTia:
        return handleWrap("unwrap");
      case wrapTia:
        return handleWrap("wrap");
      case validSwapInputs:
        return handleSwap();
      default:
        return undefined;
    }
  };

  const getButtonText = () => {
    switch (true) {
      case !userAccount.address:
        return "Connect Wallet";
      case !tokenOne?.token || !tokenTwo?.token:
        return "Select a token";
      case tokenApprovalNeeded !== null:
        return `Approve ${tokenApprovalNeeded?.coinDenom}`;
      case tokenOne?.value === undefined:
        return "Enter an amount";
      case parseFloat(tokenOne?.value) === 0 || parseFloat(tokenOne?.value) < 0:
        return "Amount must be greater than 0";
      case loading:
        return "loading...";
      case isNaN(parseFloat(tokenOne?.value)):
        return "Enter an amount";
      case tokenOneBalance === "0" ||
        parseFloat(tokenOneBalance) < parseFloat(tokenOne?.value):
        return "Insufficient funds";
      case wrapTia:
        return "Wrap";
      case unwrapTia:
        return "Unwrap";
      default:
        return "Swap";
    }
  };

  const getActionButtonText = () => {
    switch (true) {
      case txnStatus === TXN_STATUS.PENDING:
        return "Close";
      case txnStatus === TXN_STATUS.SUCCESS:
        return "Close";
      case txnStatus === TXN_STATUS.FAILED:
        return "Dismiss";
      case wrapTia:
        return "Confirm Wrap";
      case unwrapTia:
        return "Confirm Unwrap";
      default:
        return "Confirm Swap";
    }
  };

  const getTitleText = () => {
    switch (true) {
      case wrapTia:
        return "Confirm Wrap";
      case unwrapTia:
        return "Confirm Unwrap";
      case txnStatus === TXN_STATUS.FAILED:
        return "Error";
      default:
        return "Confirm Swap";
    }
  };

  const isCloseModalAction =
    txnStatus === TXN_STATUS.SUCCESS ||
    txnStatus === TXN_STATUS.FAILED ||
    txnStatus === TXN_STATUS.PENDING;

  return {
    txnHash,
    titleText: getTitleText(),
    onSubmitCallback,
    buttonText: getButtonText(),
    errorText,
    setErrorText,
    actionButtonText: getActionButtonText(),
    validSwapInputs,
    txnStatus,
    setTxnStatus,
    txnMsg,
    isCloseModalAction,
    tokenApprovalNeeded: tokenApprovalNeeded !== null,
  };
}
