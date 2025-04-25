import { useConnectModal } from "@rainbow-me/rainbowkit";
import React, { useCallback, useMemo } from "react";
import { type Address, formatUnits } from "viem";
import { useAccount, useBalance, useDisconnect } from "wagmi";

import { AstriaChain, Balance } from "@repo/flame-types";
import { useAstriaChainData, useConfig } from "config";

import { useUsdQuote } from "features/evm-wallet/hooks/use-usd-quote";

export interface AstriaWalletContextProps {
  connectWallet: () => void;
  disconnectWallet: () => void;
  accountAddress: Address | null;
  chains: AstriaChain[];
  nativeTokenBalance: Balance | null;
  isLoadingNativeTokenBalance: boolean;
  // FIXME - do we still need this here?
  //  should/can it replace the network selection implementation?
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
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  const connectWallet = useCallback(
    () => openConnectModal?.(),
    [openConnectModal],
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

  const quoteInput = useMemo(() => ({
    token: nativeToken,
    value: nativeTokenBalance?.value || "0",
  }), [nativeToken, nativeTokenBalance?.value]);
  
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
        // FIXME - should this be all Astria chains, i.e. devnet and testnet?
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
