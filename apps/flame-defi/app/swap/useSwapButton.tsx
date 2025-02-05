import { createWrapService } from "features/EvmWallet/services/SwapServices/WrapService";
import {
  useAccount,
  useConfig as useWagmiConfig,
  useWalletClient,
} from "wagmi";
import { getPublicClient } from "@wagmi/core";
import { EvmChainInfo, GetQuoteResult, TokenState } from "@repo/ui/types";
import { useEvmWallet } from "features/EvmWallet";
import { useCallback, useMemo } from "react";
import {
  createTradeFromQuote,
  SwapRouter,
} from "features/EvmWallet/services/SwapServices/SwapService";
import { SWAP_ROUTER_ADDRESS, TRADE_TYPE } from "../constants";
import { Chain } from "viem";

interface SwapButtonProps {
  inputOne: TokenState;
  inputTwo: TokenState;
  tokenOneBalance: string;
  evmChainsData: EvmChainInfo[];
  quote: GetQuoteResult | null;
  loading: boolean;
  error: string | null;
}

export function useSwapButton({
  inputOne,
  inputTwo,
  tokenOneBalance,
  evmChainsData,
  quote,
}: SwapButtonProps) {
  const wagmiConfig = useWagmiConfig();
  const userAccount = useAccount();
  const publicClient = getPublicClient(wagmiConfig, {
    chainId: evmChainsData[0]?.chainId,
  });
  const { connectEvmWallet } = useEvmWallet();
  const { data: walletClient } = useWalletClient();

  const WTIA_ADDRESS = "0x61B7794B6A0Cc383B367c327B91E5Ba85915a071";

  const handleWrap = async (type: "wrap" | "unwrap") => {
    const wrapService = createWrapService(wagmiConfig, WTIA_ADDRESS);
    if (!evmChainsData[0]?.chainId) return;

    if (type === "wrap") {
      const tx = await wrapService.deposit(
        evmChainsData[0]?.chainId,
        inputOne.value,
        inputOne.token?.coinDecimals || 18,
      );
      console.log({ tx });
      // TODO: Add loading state for these txns. This loading state will be displayed in the buttonText component.
      // TODO: Also add text pointing the user to complete the txn in their wallet
    } else {
      const tx = await wrapService.withdraw(
        evmChainsData[0]?.chainId,
        inputOne.value,
        inputOne.token?.coinDecimals || 18,
      );
      console.log({ tx });
    }
  };

  const trade = useMemo(() => {
    if (!quote) {
      return null;
    }
    return createTradeFromQuote(quote, TRADE_TYPE);
  }, [quote]);

  const handleSwap = useCallback(async () => {
    console.log("handleSwap");
    if (!trade || !userAccount.address || !evmChainsData[0]?.chainId) {
      return;
    }

    if (!walletClient || !walletClient.account) {
      console.error("No wallet connected or account is undefined.");
      return;
    }

    // Ensure publicClient is properly configured
    if (!publicClient) {
      console.error("Public client is not configured.");
      return;
    }

    try {
      const chainConfig: Chain = {
        id: evmChainsData[0]?.chainId,
        name: evmChainsData[0]?.chainName,
        nativeCurrency: {
          name: evmChainsData[0]?.currencies[0]?.title, // Assuming the first currency is the native one
          symbol: evmChainsData[0]?.currencies[0]?.coinDenom, // Assuming the first currency is the native one
          decimals: evmChainsData[0]?.currencies[0]?.coinDecimals || 18, // Assuming the first currency is the native one
        },
        rpcUrls: {
          default: {
            http: evmChainsData[0]?.rpcUrls, // Assuming these are the RPC URLs
          },
        },
      };

      // Create an instance of your router
      const router = new SwapRouter(SWAP_ROUTER_ADDRESS, chainConfig);

      // Set up the swap options
      const options = {
        recipient: userAccount.address,
        slippageTolerance: 50, // 0.5%
        deadline: Math.floor(Date.now() / 1000) + 1800, // 30 minutes from now
      };

      // Execute the swap using the walletClient instead of an ethers wallet
      const tx = await router.executeSwap(
        trade,
        options,
        walletClient,
        publicClient,
      );
      console.log("Swap executed successfully. Transaction:", tx);
    } catch (error) {
      console.error("Error executing swap:", error);
    }
  }, [trade, userAccount, evmChainsData, walletClient, publicClient]);

  const validSwapInputs =
    inputOne.token &&
    inputTwo.token &&
    inputOne.value !== undefined &&
    inputTwo.value !== undefined &&
    parseFloat(inputOne.value) > 0 &&
    parseFloat(inputTwo.value) > 0 &&
    parseFloat(inputOne.value) <= parseFloat(tokenOneBalance);

  const handleButtonAction = () => {
    if (!userAccount.address) {
      return connectEvmWallet();
    } else if (
      inputOne.token?.coinDenom === "WTIA" &&
      inputTwo.token?.coinDenom === "TIA"
    ) {
      console.log("handleSwap button action unwrap");
      return handleWrap("unwrap");
    } else if (
      inputOne.token?.coinDenom === "TIA" &&
      inputTwo.token?.coinDenom === "WTIA"
    ) {
      console.log("handleSwap button action wrap");
      return handleWrap("wrap");
    } else if (validSwapInputs) {
      console.log("handleSwap button action");
      return handleSwap();
    } else {
      return undefined;
    }
  };

  const getButtonText = () => {
    switch (true) {
      case !userAccount.address:
        return "Connect Wallet";
      case !inputOne.token || !inputTwo.token:
        return "Select a token";
      case inputOne.value === undefined || inputTwo.value === undefined:
        return "Enter an amount";
      case parseFloat(inputOne.value) === 0 || parseFloat(inputTwo.value) === 0:
        return "Amount must be greater than 0";
      case isNaN(parseFloat(inputOne.value)) ||
        isNaN(parseFloat(inputTwo.value)):
        return "Amount must be a number";
      case tokenOneBalance === "0" ||
        parseFloat(tokenOneBalance) < parseFloat(inputOne.value):
        return "Insufficient funds";
      case inputOne.token?.coinDenom === "TIA" &&
        inputTwo.token?.coinDenom === "WTIA":
        return "Wrap";
      case inputOne.token?.coinDenom === "WTIA" &&
        inputTwo.token?.coinDenom === "TIA":
        return "Unwrap";
      default:
        return "Swap";
    }
  };
  const buttonText = getButtonText();

  return { handleButtonAction, buttonText, validSwapInputs };
}
