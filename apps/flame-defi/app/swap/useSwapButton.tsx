import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicClient } from "@wagmi/core";
import {
  useAccount,
  useConfig as useWagmiConfig,
  useWaitForTransactionReceipt,
  useWalletClient,
} from "wagmi";

import { useEvmChainData } from "config";
import {
  useEvmWallet,
  createTradeFromQuote,
  createWrapService,
  SwapRouter,
} from "features/EvmWallet";
import { EvmCurrency, GetQuoteResult, TokenState } from "@repo/flame-types";
import { getSlippageTolerance, parseToBigInt } from "utils/utils";
import { TRADE_TYPE, TXN_STATUS } from "../constants";
import JSBI from "jsbi";

interface SwapButtonProps {
  tokenOne: TokenState;
  tokenTwo: TokenState;
  tokenOneBalance: string;
  quote: GetQuoteResult | null;
  loading: boolean;
  error: string | null;
  tradeType: TRADE_TYPE;
}

interface ErrorWithMessage {
  message: string;
}

const useTokenApproval = (tokenOne: TokenState, tokenTwo: TokenState) => {
  const { tokenAllowances } = useEvmWallet();
  // NOTE: this ensures the input token values are in bigInt format
  const tokenOneValueBigInt = tokenOne?.value
    ? parseToBigInt(tokenOne.value, tokenOne.token?.coinDecimals || 18)
    : JSBI.BigInt(0);
  const tokenTwoValueBigInt = tokenTwo?.value
    ? parseToBigInt(tokenTwo.value, tokenTwo.token?.coinDecimals || 18)
    : JSBI.BigInt(0);

  const tokenOneApproval = tokenAllowances.find(
    (token) => token.symbol === tokenOne?.token?.coinDenom,
  );
  const tokenTwoApproval = tokenAllowances.find(
    (token) => token.symbol === tokenTwo?.token?.coinDenom,
  );

  // NOTE: these check if the tokens input values are greater than the token allowances and returns the token if true
  if (
    tokenOneApproval &&
    JSBI.GT(tokenOneValueBigInt, tokenOneApproval?.allowance)
  ) {
    return tokenOne.token || null;
  }
  if (
    tokenTwoApproval &&
    JSBI.GT(tokenTwoValueBigInt, tokenTwoApproval?.allowance)
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
  // error,
  tradeType,
}: SwapButtonProps) {
  const { selectedChain, evmChainConfig } = useEvmChainData();
  const { approveToken } = useEvmWallet();
  const wagmiConfig = useWagmiConfig();
  const userAccount = useAccount();
  const slippageTolerance = getSlippageTolerance();
  const publicClient = getPublicClient(wagmiConfig, {
    chainId: selectedChain?.chainId,
  });
  const { connectEvmWallet } = useEvmWallet();
  const { data: walletClient } = useWalletClient();
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS | undefined>(undefined);
  const [txnMsg, setTxnMsg] = useState<string | undefined>(undefined);
  const [txnHash, setTxnHash] = useState<`0x${string}` | undefined>(undefined);
  const result = useWaitForTransactionReceipt({ hash: txnHash });
  const tokenApprovalNeeded = useTokenApproval(tokenOne, tokenTwo);

  const wrapTia =
    tokenOne?.token?.coinDenom === "TIA" &&
    tokenTwo?.token?.coinDenom === "WTIA";
  const unwrapTia =
    tokenOne?.token?.coinDenom === "WTIA" &&
    tokenTwo?.token?.coinDenom === "TIA";

  const handleErrorMsgs = (error?: string, defaultMsg?: string) => {
    if (error?.includes("rejected")) {
      setTxnMsg("Transaction rejected");
    } else if (defaultMsg) {
      setTxnMsg(defaultMsg);
    } else {
      setTxnMsg("Transaction error");
    }
  };

  useEffect(() => {
    if (result.data?.status === "success") {
      setTxnStatus(TXN_STATUS.SUCCESS);
    } else if (result.data?.status === "reverted") {
      setTxnStatus(TXN_STATUS.FAILED);
      handleErrorMsgs("", "Transaction reverted");
    } else if (result.data?.status === "error") {
      setTxnStatus(TXN_STATUS.FAILED);
      handleErrorMsgs("", "Transaction failed");
    }
  }, [result.data]);

  const handleWrap = async (type: "wrap" | "unwrap") => {
    const wtiaAddress = selectedChain.contracts?.wrappedCelestia?.address;
    if (!selectedChain?.chainId || !wtiaAddress) {
      return;
    }
    setTxnStatus(TXN_STATUS.PENDING);

    const wrapService = createWrapService(wagmiConfig, wtiaAddress);

    if (type === "wrap") {
      try {
        const tx = await wrapService.deposit(
          selectedChain.chainId,
          tokenOne.value,
          tokenOne.token?.coinDecimals || 18,
        );
        setTxnHash(tx);
      } catch (error) {
        const errorMessage =
          (error as ErrorWithMessage).message || "Error unwrapping";
        setTxnStatus(TXN_STATUS.FAILED);
        handleErrorMsgs(errorMessage);
      }
    } else {
      try {
        const tx = await wrapService.withdraw(
          selectedChain.chainId,
          tokenOne.value,
          tokenOne.token?.coinDecimals || 18,
        );
        setTxnHash(tx);
      } catch (error) {
        const errorMessage =
          (error as ErrorWithMessage).message || "Error unwrapping";
        setTxnStatus(TXN_STATUS.FAILED);
        handleErrorMsgs(errorMessage);
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
    if (
      !trade ||
      !userAccount.address ||
      !selectedChain?.chainId ||
      !walletClient ||
      !walletClient.account ||
      !publicClient
    ) {
      return;
    }

    setTxnStatus(TXN_STATUS.PENDING);
    try {
      const swapRouterAddress = selectedChain.contracts?.swapRouter?.address;
      if (!swapRouterAddress) {
        console.warn("Swap router address is not defined. Cannot swap.");
        return;
      }
      const router = new SwapRouter(swapRouterAddress, evmChainConfig);
      const options = {
        recipient: userAccount.address,
        slippageTolerance: slippageTolerance,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1800), // 30 minutes from now
      };

      const tx = await router.executeSwap(
        trade,
        options,
        walletClient,
        publicClient,
      );
      setTxnHash(tx);
    } catch (error) {
      const errorMessage =
        (error as ErrorWithMessage).message || "Error executing swap";
      setTxnStatus(TXN_STATUS.FAILED);
      handleErrorMsgs(errorMessage);
    }
  }, [
    trade,
    evmChainConfig,
    userAccount,
    selectedChain,
    walletClient,
    publicClient,
    slippageTolerance,
  ]);

  const handleTokenApproval = async (token: EvmCurrency | null) => {
    if (!token) {
      return;
    }
    const txHash = await approveToken(token);

    if (txHash) {
      setTxnHash(txHash);
    }
    return txHash;
  };

  const validSwapInputs =
    !loading &&
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
    actionButtonText: getActionButtonText(),
    validSwapInputs,
    txnStatus,
    setTxnStatus,
    txnMsg,
    isCloseModalAction,
    tokenApprovalNeeded: tokenApprovalNeeded !== null,
  };
}
