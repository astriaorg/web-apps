import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
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
import { TRADE_TYPE, TransactionStatus } from "@repo/flame-types";
import { getSlippageTolerance } from "@repo/ui/utils";
import { useAstriaChainData } from "config";
import { useConfig } from "config";
import {
  createSwapRouterService,
  createTradeFromQuote,
  createWethService,
  useAstriaWallet,
  useTokenApproval,
} from "features/evm-wallet";

interface SwapButtonProps {
  token0: TokenInputState;
  token1: TokenInputState;
  token0Balance: string;
  quote: GetQuoteResult | null;
  loading: boolean;
  error: string | null;
  tradeType: TRADE_TYPE;
}

export function useSwapButton({
  token0: topToken,
  token1: bottomToken,
  token0Balance: topTokenBalance,
  quote,
  loading,
  error: quoteError,
  tradeType,
}: SwapButtonProps) {
  const { chain } = useAstriaChainData();
  const { feeRecipient } = useConfig();
  const config = useWagmiConfig();
  const userAccount = useAccount();
  const slippageTolerance = getSlippageTolerance();
  const addRecentTransaction = useAddRecentTransaction();
  const { connectWallet } = useAstriaWallet();
  const [status, setStatus] = useState<TransactionStatus | undefined>(
    undefined,
  );
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [hash, setHash] = useState<Hash | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const result = useWaitForTransactionReceipt({ hash: hash });

  const { handleTokenApproval, getTokenNeedingApproval } = useTokenApproval({
    chain,
    addressToApprove: chain.contracts.swapRouter.address,
    setStatus,
    setHash,
    setError,
  });
  const tokenNeedingApproval = getTokenNeedingApproval(topToken);

  const wrapTia =
    topToken.token?.isNative && bottomToken.token?.isWrappedNative;
  const unwrapTia =
    topToken.token?.isWrappedNative && bottomToken.token?.isNative;

  const handleTransactionModalErrorMsgs = (
    error: string,
    defaultMsg?: string,
  ) => {
    if (error.includes("rejected")) {
      setMessage("Transaction rejected");
    } else if (defaultMsg) {
      setMessage(defaultMsg);
    } else {
      setMessage("Transaction error");
    }
  };

  useEffect(() => {
    if (quoteError) {
      setError(quoteError);
    } else {
      setError(null);
    }
  }, [quoteError]);

  useEffect(() => {
    if (!userAccount.address) {
      return;
    }
    if (result.data?.status === "success") {
      setStatus(TransactionStatus.SUCCESS);
      addRecentTransaction({
        hash: hash || "",
        description: "Successful transaction",
      });
    } else if (result.data?.status === "reverted") {
      setStatus(TransactionStatus.FAILED);
      handleTransactionModalErrorMsgs("", "Transaction reverted");
    } else if (result.data?.status === "error") {
      setStatus(TransactionStatus.FAILED);
      handleTransactionModalErrorMsgs("", "Transaction failed");
    }
  }, [result.data, hash, addRecentTransaction, userAccount.address]);

  const handleWrap = async (type: "wrap" | "unwrap") => {
    const wtiaAddress = chain.contracts.wrappedNativeToken?.address;
    if (!chain.chainId || !wtiaAddress) {
      return;
    }
    setStatus(TransactionStatus.PENDING);

    const wethService = createWethService(config, wtiaAddress);

    if (type === "wrap") {
      try {
        const tx = await wethService.deposit(
          chain.chainId,
          topToken.value,
          topToken.token?.coinDecimals || 18,
        );
        setHash(tx);
      } catch (error) {
        const errorMessage =
          (error instanceof Error && error.message) || "Error unwrapping";
        setStatus(TransactionStatus.FAILED);
        handleTransactionModalErrorMsgs(errorMessage);
      }
    } else {
      try {
        const tx = await wethService.withdraw(
          chain.chainId,
          bottomToken.value,
          bottomToken.token?.coinDecimals || 18,
        );
        setHash(tx);
      } catch (error) {
        const errorMessage =
          (error instanceof Error && error.message) || "Error unwrapping";
        setStatus(TransactionStatus.FAILED);
        handleTransactionModalErrorMsgs(errorMessage);
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
    setStatus(TransactionStatus.PENDING);
    try {
      const swapRouterAddress = chain.contracts.swapRouter?.address;
      if (!swapRouterAddress) {
        console.warn("Swap router address is not defined. Cannot swap.");
        return;
      }

      const swapRouterService = createSwapRouterService(
        config,
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
      setHash(tx);
    } catch (error) {
      const errorMessage =
        (error instanceof Error && error.message) || "Error executing swap";
      setStatus(TransactionStatus.FAILED);
      handleTransactionModalErrorMsgs(errorMessage);
    }
  }, [
    trade,
    topToken.token?.coinDenom,
    bottomToken.token?.coinDenom,
    userAccount,
    chain,
    config,
    slippageTolerance,
    feeRecipient,
  ]);

  // FIXME - parseFloat is not sufficient for huge numbers
  const validSwapInputs = Boolean(
    !loading &&
      status !== TransactionStatus.PENDING &&
      error === null &&
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
      case tokenNeedingApproval !== null &&
        status !== TransactionStatus.PENDING:
        return `Approve ${tokenNeedingApproval.token?.coinDenom}`;
      case tokenNeedingApproval !== null &&
        status === TransactionStatus.PENDING:
        return "Pending wallet approval...";
      case status === TransactionStatus.PENDING:
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
      case status === TransactionStatus.PENDING:
        return "Close";
      case status === TransactionStatus.SUCCESS:
        return "Close";
      case status === TransactionStatus.FAILED:
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
      case status === TransactionStatus.FAILED:
        return "Error";
      default:
        return "Confirm Swap";
    }
  };

  return {
    hash,
    titleText: getTitleText(),
    onSubmitCallback,
    buttonText: getButtonText(),
    error,
    setError,
    actionButtonText: getActionButtonText(),
    validSwapInputs,
    status,
    setStatus,
    message,
    tokenApprovalNeeded:
      tokenNeedingApproval !== null && status !== TransactionStatus.PENDING,
  };
}
