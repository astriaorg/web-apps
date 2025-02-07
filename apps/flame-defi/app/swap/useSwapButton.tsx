import { useCallback, useEffect, useMemo, useState } from "react";
import { getPublicClient } from "@wagmi/core";
import {
  useAccount,
  useConfig as useWagmiConfig,
  useWaitForTransactionReceipt,
  useWalletClient,
} from "wagmi";
import { Chain } from "viem";

import { useEvmChainData } from "config";
import {
  useEvmWallet,
  createTradeFromQuote,
  createWrapService,
  SwapRouter,
} from "features/EvmWallet";
import { EvmChainInfo, GetQuoteResult, TokenState } from "@repo/flame-types";
import { QUOTE_TYPE, TXN_STATUS } from "../constants";
import { getSlippageTolerance } from "utils/utils";

interface SwapButtonProps {
  tokenOne: TokenState;
  tokenTwo: TokenState;
  tokenOneBalance: string;
  selectedChain: EvmChainInfo;
  quote: GetQuoteResult | null;
  loading: boolean;
  error: string | null;
  quoteType: QUOTE_TYPE;
}

export function useSwapButton({
  tokenOne,
  tokenTwo,
  tokenOneBalance,
  selectedChain,
  quote,
  loading,
  error,
  quoteType,
}: SwapButtonProps) {
  const wagmiConfig = useWagmiConfig();
  const userAccount = useAccount();
  const slippageTolerance = getSlippageTolerance();
  const publicClient = getPublicClient(wagmiConfig, {
    chainId: selectedChain?.chainId,
  });
  const { connectEvmWallet } = useEvmWallet();
  const { data: walletClient } = useWalletClient();
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS | undefined>(undefined);
  const [txnHash, setTxnHash] = useState<`0x${string}` | undefined>(undefined);
  const wrapTia =
    tokenOne?.token?.coinDenom === "TIA" &&
    tokenTwo?.token?.coinDenom === "WTIA";
  const unwrapTia =
    tokenOne?.token?.coinDenom === "WTIA" &&
    tokenTwo?.token?.coinDenom === "TIA";
  const result = useWaitForTransactionReceipt({ hash: txnHash });

  useEffect(() => {
    if (result.data?.status === "success") {
      setTxnStatus(TXN_STATUS.SUCCESS);
    } else if (result.data?.status === "reverted") {
      setTxnStatus(TXN_STATUS.FAILED);
    } else if (result.data?.status === "error") {
      setTxnStatus(TXN_STATUS.FAILED);
    }
  }, [result.data]);

  const handleWrap = async (type: "wrap" | "unwrap") => {
    setTxnStatus(TXN_STATUS.PENDING);
    if (!selectedChain?.chainId) {
      // TODO - handle error better?
      console.error("Chain ID is not defined. Cannot wrap/unwrap.");
      return;
    }
    const wtiaAddress = selectedChain.contracts?.wrappedCelestia?.address;
    if (!wtiaAddress) {
      // TODO - handle error better?
      console.error("WTIA address is not defined. Cannot wrap/unwrap.");
      return;
    }

    const wrapService = createWrapService(wagmiConfig, wtiaAddress);
    if (type === "wrap") {
      const tx = await wrapService.deposit(
        selectedChain.chainId,
        tokenOne.value,
        tokenOne.token?.coinDecimals || 18,
      );
      setTxnHash(tx);
      // TODO: Add loading state for these txns. This loading state will be displayed in the buttonText component.
      // TODO: Also add text pointing the user to complete the txn in their wallet
    } else {
      const tx = await wrapService.withdraw(
        selectedChain.chainId,
        tokenOne.value,
        tokenOne.token?.coinDecimals || 18,
      );
      setTxnHash(tx);
    }
  };

  const trade = useMemo(() => {
    if (!quote) {
      return null;
    }
    return createTradeFromQuote(quote, quoteType);
  }, [quote, quoteType]);

  const handleSwap = useCallback(async () => {
    if (!trade || !userAccount.address || !selectedChain?.chainId) {
      return;
    }
    if (!walletClient || !walletClient.account) {
      console.error("No wallet connected or account is undefined.");
      return;
    }
    if (!publicClient) {
      console.error("Public client is not configured.");
      return;
    }

    setTxnStatus(TXN_STATUS.PENDING);

    try {
      const chainConfig: Chain = {
        id: selectedChain?.chainId,
        name: selectedChain?.chainName,
        nativeCurrency: {
          name: selectedChain?.currencies[0]?.title, // Assuming the first currency is the native one
          symbol: selectedChain?.currencies[0]?.coinDenom, // Assuming the first currency is the native one
          decimals: selectedChain?.currencies[0]?.coinDecimals || 18, // Assuming the first currency is the native one
        },
        rpcUrls: {
          default: {
            http: selectedChain?.rpcUrls, // Assuming these are the RPC URLs
          },
        },
      };

      const swapRouterAddress = selectedChain.contracts?.swapRouter?.address;
      if (!swapRouterAddress) {
        console.error("Swap router address is not defined. Cannot swap.");
        return;
      }

      const router = new SwapRouter(swapRouterAddress, chainConfig);

      // Set up the swap options
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
      console.error("Error executing swap:", error);
    }
  }, [trade, userAccount, selectedChain, walletClient, publicClient]);

  const validSwapInputs =
    !loading &&
    tokenOne?.token &&
    tokenTwo?.token &&
    tokenOne?.value !== undefined &&
    parseFloat(tokenOne?.value) > 0 &&
    parseFloat(tokenOne?.value) <= parseFloat(tokenOneBalance);

  const onSubmitCallback = () => {
    if (!userAccount.address) {
      return connectEvmWallet();
    } else if (unwrapTia) {
      return handleWrap("unwrap");
    } else if (wrapTia) {
      return handleWrap("wrap");
    } else if (validSwapInputs) {
      return handleSwap();
    } else {
      return undefined;
    }
  };

  const getButtonText = () => {
    switch (true) {
      case !userAccount.address:
        return "Connect Wallet";
      case !tokenOne?.token || !tokenTwo?.token:
        return "Select a token";
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

  const isCloseModalAction =
    txnStatus === TXN_STATUS.SUCCESS ||
    txnStatus === TXN_STATUS.FAILED ||
    txnStatus === TXN_STATUS.PENDING;

  return {
    onSubmitCallback,
    buttonText: getButtonText(),
    actionButtonText: getActionButtonText(),
    validSwapInputs,
    txnStatus,
    setTxnStatus,
    isCloseModalAction,
  };
}
