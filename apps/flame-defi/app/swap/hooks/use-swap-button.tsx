import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address, Hash } from "viem";
import {
  useAccount,
  useConfig as useWagmiConfig,
  useWaitForTransactionReceipt,
} from "wagmi";

import {
  evmChainToViemChain,
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

interface SwapButtonReturn {
  /** Transaction hash after submission */
  hash?: Hash;
  /** Text to display in the modal title */
  titleText: string;
  /** Callback function that handles wallet connection, chain switching, token approval, and swap execution based on current state */
  onSubmitCallback: () => void;
  /** Text to display on the main swap button */
  buttonText: string;
  /** Current error message if any */
  error: string | null;
  /** Function to set the current error state */
  setError: (error: string | null) => void;
  /** Text to display on the confirmation button in the modal */
  actionButtonText: string;
  /** Whether all swap inputs are valid and ready for submission */
  validSwapInputs: boolean;
  /** Current transaction status */
  status: TransactionStatus;
  /** Function to update the transaction status */
  setStatus: (status: TransactionStatus) => void;
  /** Optional message to display (usually for errors) */
  message?: string;
  /** Whether token approval is needed before swap can proceed */
  tokenApprovalNeeded: boolean;
}

export function useSwapButton({
  token0: topToken,
  token1: bottomToken,
  token0Balance: topTokenBalance,
  quote,
  loading,
  error: quoteError,
  tradeType,
}: SwapButtonProps): SwapButtonReturn {
  const { chain } = useAstriaChainData();
  const { feeRecipient } = useConfig();
  const config = useWagmiConfig();
  const userAccount = useAccount();
  const { connectWallet, connectToFlame, isConnectedToFlameChain } =
    useAstriaWallet();
  const slippageTolerance = getSlippageTolerance();
  const [status, setStatus] = useState<TransactionStatus>(
    TransactionStatus.IDLE,
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
      setMessage("Transaction rejected.");
    } else if (defaultMsg) {
      setMessage(defaultMsg);
    } else {
      setMessage("Transaction error.");
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
    } else if (result.data?.status === "reverted") {
      setStatus(TransactionStatus.FAILED);
      handleTransactionModalErrorMsgs("", "Transaction reverted.");
    } else if (result.data?.status === "error") {
      setStatus(TransactionStatus.FAILED);
      handleTransactionModalErrorMsgs("", "Transaction failed.");
    }
  }, [result.data, hash, userAccount.address]);

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
          (error instanceof Error && error.message) || "Error unwrapping.";
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
          (error instanceof Error && error.message) || "Error unwrapping.";
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
        evmChainToViemChain(chain),
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
      case !isConnectedToFlameChain:
        return connectToFlame();
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
    const defaultText = "Swap";

    switch (true) {
      case !userAccount.address:
        return "Connect Wallet";
      case !isConnectedToFlameChain:
        return "Switch to Flame Chain";
      case !topToken.token || !bottomToken.token:
        return "Select a Token";
      case tokenNeedingApproval !== null &&
        status !== TransactionStatus.PENDING:
        return `Approve ${tokenNeedingApproval.token?.coinDenom}`;
      case tokenNeedingApproval !== null &&
        status === TransactionStatus.PENDING:
        return "Pending wallet approval...";
      case status === TransactionStatus.PENDING:
        return "Pending...";
      case topToken.value === undefined:
        return defaultText;
      case parseFloat(topToken.value) === 0 || parseFloat(topToken.value) < 0:
        return "Invalid Amount";
      case loading:
        return "Loading...";
      case isNaN(parseFloat(topToken.value)):
        return defaultText;
      case topTokenBalance === "0" ||
        parseFloat(topTokenBalance) < parseFloat(topToken.value):
        return "Insufficient Balance";
      case wrapTia:
        return "Wrap";
      case unwrapTia:
        return "Unwrap";
      default:
        return defaultText;
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
