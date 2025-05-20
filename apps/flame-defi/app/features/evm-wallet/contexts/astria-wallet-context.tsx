import { usePrivy } from "@privy-io/react-auth";
import React, { useCallback, useMemo } from "react";
import { type Address, formatUnits } from "viem";
import { useAccount, useBalance, useDisconnect } from "wagmi";

import { AstriaChain, Balance } from "@repo/flame-types";
import { useAstriaChainData, useConfig } from "config";

import { useUsdQuote } from "../hooks/use-usd-quote";

export interface AstriaWalletContextProps {
  connectWallet: () => void;
  disconnectWallet: () => void;
  accountAddress: Address | null;
  chains: AstriaChain[];
  nativeTokenBalance: Balance | null;
  isLoadingNativeTokenBalance: boolean;
  chain: AstriaChain | null;
  usdcToNativeQuote: Balance;
  quoteLoading: boolean;
}

export const AstriaWalletContext =
  React.createContext<AstriaWalletContextProps>({} as AstriaWalletContextProps);

export const AstriaWalletContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { astriaChains } = useConfig();
  const { chain, nativeToken } = useAstriaChainData();
  const userAccount = useAccount();
  const { connectOrCreateWallet, logout } = usePrivy();
  const { disconnect } = useDisconnect();

  const connectWallet = useCallback(
    () => connectOrCreateWallet(),
    [connectOrCreateWallet],
  );

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

  const { quote, loading: quoteLoading } = useUsdQuote(quoteInput);

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
        disconnectWallet: disconnect,
        accountAddress: userAccount.address ?? null,
        chains: Object.values(astriaChains),
        nativeTokenBalance,
        isLoadingNativeTokenBalance,
        chain,
        usdcToNativeQuote,
        quoteLoading,
      }}
    >
      {children}
    </AstriaWalletContext.Provider>
  );
};
