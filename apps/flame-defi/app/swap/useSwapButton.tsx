import { createWrapService } from "features/EvmWallet/services/SwapServices/WrapService";
import { useAccount, useConfig as useWagmiConfig, useWaitForTransactionReceipt, useWalletClient } from "wagmi";
import { getPublicClient } from "@wagmi/core";
import { GetQuoteResult, TokenState } from "@repo/ui/types";
import { useEvmWallet } from "features/EvmWallet";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createTradeFromQuote, SwapRouter } from "features/EvmWallet/services/SwapServices/SwapService";
import { SWAP_ROUTER_ADDRESS, QUOTE_TYPE, TXN_STATUS } from "../constants";
import { Chain } from "viem";
import { useEvmChainData } from "config";
interface SwapButtonProps {
  tokenOne: TokenState,
  tokenTwo: TokenState,
  tokenOneBalance: string,
  quote: GetQuoteResult | null,
  loading: boolean,
  error: string | null,
  quoteType: QUOTE_TYPE,
}

export function useSwapButton({
  tokenOne,
  tokenTwo,
  tokenOneBalance,
  quote,
  loading,
  error,
  quoteType,
}: SwapButtonProps) {
  const wagmiConfig = useWagmiConfig();
  const userAccount = useAccount();
  const { chainId, evmChainsData, currencies } = useEvmChainData();
  const publicClient = getPublicClient(wagmiConfig, { chainId: chainId });
  const { connectEvmWallet } = useEvmWallet();
  const { data: walletClient } = useWalletClient();
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS | undefined>(undefined);
  const [txnHash, setTxnHash] = useState<`0x${string}` | undefined>(undefined);
  const WTIA_ADDRESS = "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071";
  const wrapTia = tokenOne?.token?.coinDenom === "TIA" &&
      tokenTwo?.token?.coinDenom === "WTIA"
  const unwrapTia = tokenOne?.token?.coinDenom === "WTIA" &&
      tokenTwo?.token?.coinDenom === "TIA"
  const result = useWaitForTransactionReceipt({hash: txnHash});

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
    const wrapService = createWrapService(wagmiConfig, WTIA_ADDRESS);
    if (!chainId) return;
    setTxnStatus(TXN_STATUS.PENDING);

    if (type === "wrap") {
      const tx = await wrapService.deposit(
        chainId,
        tokenOne.value,
        tokenOne.token?.coinDecimals || 18
      );
      setTxnHash(tx);
      // TODO: Add loading state for these txns. This loading state will be displayed in the buttonText component.
      // TODO: Also add text pointing the user to complete the txn in their wallet
    } else {
      const tx = await wrapService.withdraw(
        chainId,
        tokenOne.value,
        tokenOne.token?.coinDecimals || 18
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
    if (!trade || !userAccount.address || !chainId) {
      return;
    }
    if (!walletClient || !walletClient.account) {
      console.error('No wallet connected or account is undefined.');
      return;
    }
    if (!publicClient) {
      console.error('Public client is not configured.');
      return;
    }

    setTxnStatus(TXN_STATUS.PENDING);

    try {
      const chainConfig: Chain = {
        id: chainId,
        name: evmChainsData?.chainName || "",
        nativeCurrency: {
          name: currencies?.[0]?.title || "",
          symbol: currencies?.[0]?.coinDenom || "",
          decimals: currencies?.[0]?.coinDecimals || 18,
        },
        rpcUrls: {
          default: {
            http: evmChainsData?.rpcUrls || [],
          },
        },
      };
      const router = new SwapRouter(SWAP_ROUTER_ADDRESS, chainConfig);

      const options = {
        recipient: userAccount.address,
        slippageTolerance: 10, // 0.5%
        deadline: Math.floor(Date.now() / 1000) + 1800, // 30 minutes from now
      };
      const tx = await router.executeSwap(trade, options, walletClient, publicClient) as `0x${string}`;
      setTxnHash(tx);
    } catch (error) {
      setTxnStatus(TXN_STATUS.FAILED);
      console.error('Error executing swap:', error);
    }
  }, [trade, userAccount, chainId, evmChainsData, currencies, walletClient, publicClient]);

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

  const isCloseModalAction = txnStatus === TXN_STATUS.SUCCESS || txnStatus === TXN_STATUS.FAILED || txnStatus === TXN_STATUS.PENDING

  return { onSubmitCallback, buttonText: getButtonText(), actionButtonText: getActionButtonText(), validSwapInputs, txnStatus, setTxnStatus, isCloseModalAction};
}
