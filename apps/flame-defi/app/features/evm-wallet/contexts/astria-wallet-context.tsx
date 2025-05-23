import { usePrivy } from "@privy-io/react-auth";
import React, { useCallback, useMemo } from "react";
import { type Address, formatUnits } from "viem";
import { useAccount, useBalance, useDisconnect, useSwitchChain } from "wagmi";

import { AstriaChain, Balance } from "@repo/flame-types";
import { useAstriaChainData } from "config";

import { useUsdQuote } from "../hooks/use-usd-quote";

export interface AstriaWalletContextProps {
  connectWallet: () => void;
  disconnectWallet: () => void;
  switchToFlameChain: () => void;
  accountAddress: Address | null;
  nativeTokenBalance: Balance | null;
  isLoadingNativeTokenBalance: boolean;
  chain: AstriaChain | null;
  usdcToNativeQuote: Balance;
  quoteLoading: boolean;
  isConnectedToFlameChain: boolean;
}

export const AstriaWalletContext =
  React.createContext<AstriaWalletContextProps>({} as AstriaWalletContextProps);

/**
 * Provider for the Astria wallet context. The Astria wallet context
 * differs from the EVM wallet context in that it is for pages that
 * only need to connect to Flame and not other EVM chains.
 *
 * E.g., the swap page only needs to connect to Flame and not other EVM chains.
 */
export const AstriaWalletContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { chain, nativeToken } = useAstriaChainData();
  const userAccount = useAccount();
  const { connectOrCreateWallet, logout } = usePrivy();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const connectWallet = useCallback(
    () => connectOrCreateWallet(),
    [connectOrCreateWallet],
  );

  const disconnectWallet = useCallback(async () => {
    disconnect();
    // FIXME - do we want to logout the privy user here too?
    await logout();
  }, [disconnect, logout]);

  const switchToFlameChain = useCallback(() => {
    if (!userAccount.address) {
      // First connect wallet, then the user can switch chains afterward
      connectOrCreateWallet();
    } else {
      switchChain({ chainId: chain.chainId });
    }
  }, [userAccount.address, chain.chainId, connectOrCreateWallet, switchChain]);

  const isConnectedToFlameChain = useMemo(() => {
    return Boolean(
      userAccount.address && userAccount.chainId === chain.chainId,
    );
  }, [userAccount.address, userAccount.chainId, chain.chainId]);

  const {
    status: nativeBalanceStatus,
    data: nativeBalance,
    isLoading: isLoadingNativeTokenBalance,
  } = useBalance({ address: userAccount.address });

  const nativeTokenBalance = useMemo(() => {
    if (nativeBalanceStatus !== "success") {
      return null;
    }
    const formattedBalance = formatUnits(
      nativeBalance.value,
      nativeBalance.decimals,
    );

    return { value: formattedBalance, symbol: nativeBalance.symbol };
  }, [nativeBalance, nativeBalanceStatus]);

  const quoteInput = useMemo(
    () => ({
      token: nativeToken,
      value: nativeTokenBalance?.value || "0",
    }),
    [nativeToken, nativeTokenBalance?.value],
  );

  const { quote, isLoading: quoteLoading } = useUsdQuote(quoteInput);

  const usdcToNativeQuote = useMemo<Balance>(() => {
    if (!quote) {
      return {
        value: "0",
        symbol: "usdc",
      };
    }

    return {
      value: quote.quoteDecimals,
      symbol: "usdc",
    };
  }, [quote]);

  return (
    <AstriaWalletContext.Provider
      value={{
        connectWallet,
        disconnectWallet,
        switchToFlameChain,
        accountAddress: userAccount.address ?? null,
        nativeTokenBalance,
        isLoadingNativeTokenBalance,
        chain,
        usdcToNativeQuote,
        quoteLoading,
        isConnectedToFlameChain,
      }}
    >
      {children}
    </AstriaWalletContext.Provider>
  );
};
