import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useAstriaChainData } from "config";
import { useConfig } from "config";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type Address, Chain, type Hash } from "viem";
import {
  useAccount,
  useConfig as useWagmiConfig,
  useWaitForTransactionReceipt,
} from "wagmi";

import {
  evmChainToRainbowKitChain,
  GetQuoteResult,
  TokenInputState,
} from "@repo/flame-types";
import { TRADE_TYPE, TXN_STATUS } from "@repo/flame-types";
import { getSlippageTolerance } from "@repo/ui/utils";
import {
  createSwapRouterService,
  createTradeFromQuote,
  createWethService,
  useAstriaWallet,
  useTokenApproval,
} from "features/evm-wallet";

interface SwapButtonProps {
  topToken: TokenInputState;
  bottomToken: TokenInputState;
  topTokenBalance: string;
  quote: GetQuoteResult | null;
  loading: boolean;
  quoteError: string | null;
  tradeType: TRADE_TYPE;
}

export function useSwapButton({
  topToken,
  bottomToken,
  topTokenBalance,
  quote,
  loading,
  quoteError,
  tradeType,
}: SwapButtonProps) {
  const { chain } = useAstriaChainData();
  const { feeRecipient } = useConfig();
  const wagmiConfig = useWagmiConfig();
  const userAccount = useAccount();
  const slippageTolerance = getSlippageTolerance();
  const addRecentTransaction = useAddRecentTransaction();
  const { connectWallet } = useAstriaWallet();
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS | undefined>(undefined);
  const [txnMsg, setTxnMsg] = useState<string | undefined>(undefined);
  const [txnHash, setTxnHash] = useState<Hash | undefined>(undefined);
  const [errorText, setErrorText] = useState<string | null>(null);
  const result = useWaitForTransactionReceipt({ hash: txnHash });

  const { handleTokenApproval, getTokenNeedingApproval } = useTokenApproval({
    chain,
    addressToApprove: chain.contracts.swapRouter.address,
    setTxnStatus,
    setTxnHash,
    setErrorText,
  });
  const tokenNeedingApproval = getTokenNeedingApproval(topToken);

  const wrapTia =
    topToken.token?.isNative && bottomToken.token?.isWrappedNative;
  const unwrapTia =
    topToken.token?.isWrappedNative && bottomToken.token?.isNative;

  const handleTxnModalErrorMsgs = (error: string, defaultMsg?: string) => {
    if (error.includes("rejected")) {
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
    if (!userAccount.address) {
      return;
    }
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
  }, [result.data, txnHash, addRecentTransaction, userAccount.address]);

  const handleWrap = async (type: "wrap" | "unwrap") => {
    const wtiaAddress = chain.contracts.wrappedNativeToken?.address;
    if (!chain.chainId || !wtiaAddress) {
      return;
    }
    setTxnStatus(TXN_STATUS.PENDING);

    const wethService = createWethService(wagmiConfig, wtiaAddress);

    if (type === "wrap") {
      try {
        const tx = await wethService.deposit(
          chain.chainId,
          topToken.value,
          topToken.token?.coinDecimals || 18,
        );
        setTxnHash(tx);
      } catch (error) {
        const errorMessage =
          (error instanceof Error && error.message) || "Error unwrapping";
        setTxnStatus(TXN_STATUS.FAILED);
        handleTxnModalErrorMsgs(errorMessage);
      }
    } else {
      try {
        const tx = await wethService.withdraw(
          chain.chainId,
          bottomToken.value,
          bottomToken.token?.coinDecimals || 18,
        );
        setTxnHash(tx);
      } catch (error) {
        const errorMessage =
          (error instanceof Error && error.message) || "Error unwrapping";
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
    if (!trade || !userAccount.address || !chain.chainId) {
      return;
    }
    setTxnStatus(TXN_STATUS.PENDING);
    try {
      const swapRouterAddress = chain.contracts.swapRouter?.address;
      if (!swapRouterAddress) {
        console.warn("Swap router address is not defined. Cannot swap.");
        return;
      }

      const swapRouterService = createSwapRouterService(
        wagmiConfig,
        swapRouterAddress as Address,
        evmChainToRainbowKitChain(chain) as Chain,
      );

      const options = {
        recipient: userAccount.address,
        slippageTolerance: slippageTolerance,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1800), // 30 minutes from now
        isNativeIn: topToken.token?.coinDenom.toLocaleLowerCase() === "tia",
        isNativeOut: bottomToken.token?.coinDenom.toLocaleLowerCase() === "tia",
        feeRecipient,
      };

      const tx = await swapRouterService.executeSwap(
        chain.chainId,
        trade,
        options,
      );
      setTxnHash(tx);
    } catch (error) {
      const errorMessage =
        (error instanceof Error && error.message) || "Error executing swap";
      setTxnStatus(TXN_STATUS.FAILED);
      handleTxnModalErrorMsgs(errorMessage);
    }
  }, [
    trade,
    topToken.token?.coinDenom,
    bottomToken.token?.coinDenom,
    userAccount,
    chain,
    wagmiConfig,
    slippageTolerance,
    feeRecipient,
  ]);

  // FIXME - parseFloat is not sufficient for huge numbers
  const validSwapInputs = Boolean(
    !loading &&
      txnStatus !== TXN_STATUS.PENDING &&
      errorText === null &&
      topToken.token &&
      bottomToken.token &&
      topToken.value !== undefined &&
      bottomToken.value !== undefined &&
      parseFloat(topToken.value) > 0 &&
      parseFloat(bottomToken.value) > 0 &&
      parseFloat(topToken.value) <= parseFloat(topTokenBalance),
  );

  const onSubmitCallback = () => {
    switch (true) {
      case !userAccount.address:
        return connectWallet();
      case tokenNeedingApproval !== null:
        return handleTokenApproval(tokenNeedingApproval);
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

  // FIXME - parseFloat is not sufficient for huge numbers
  const getButtonText = () => {
    switch (true) {
      case !userAccount.address:
        return "Connect Wallet";
      case !topToken.token || !bottomToken.token:
        return "Select a token";
      case tokenNeedingApproval !== null && txnStatus !== TXN_STATUS.PENDING:
        return `Approve ${tokenNeedingApproval.token?.coinDenom}`;
      case tokenNeedingApproval !== null && txnStatus === TXN_STATUS.PENDING:
        return "Pending wallet approval...";
      case txnStatus === TXN_STATUS.PENDING:
        return "Pending...";
      case topToken.value === undefined:
        return "Enter an amount";
      case parseFloat(topToken.value) === 0 || parseFloat(topToken.value) < 0:
        return "Amount must be greater than 0";
      case loading:
        return "loading...";
      case isNaN(parseFloat(topToken.value)):
        return "Enter an amount";
      case topTokenBalance === "0" ||
        parseFloat(topTokenBalance) < parseFloat(topToken.value):
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
    tokenApprovalNeeded:
      tokenNeedingApproval !== null && txnStatus !== TXN_STATUS.PENDING,
  };
}
