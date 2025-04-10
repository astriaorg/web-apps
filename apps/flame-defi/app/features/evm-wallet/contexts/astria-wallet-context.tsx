import { useConnectModal } from "@rainbow-me/rainbowkit";
import React, { useCallback, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import { formatUnits } from "viem";
import { useAccount, useBalance, useDisconnect } from "wagmi";

import { AstriaChain, Balance, HexString, TRADE_TYPE } from "@repo/flame-types";
import { useAstriaChainData, useConfig } from "config";
import { useGetQuote } from "../hooks/use-get-quote";

export interface AstriaWalletContextProps {
  connectWallet: () => void;
  disconnectWallet: () => void;
  accountAddress: HexString | null;
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
  const { currencies } = chain;
  const { quote, loading: quoteLoading, getQuote } = useGetQuote();
  const { formatNumber } = useIntl();

  const userAccount = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  const connectWallet = useCallback(() => {
    if (openConnectModal) {
      openConnectModal();
    }
  }, [openConnectModal]);

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

  // get usdc quote of native token for display
  useEffect(() => {
    if (!nativeTokenBalance) {
      return;
    }
    const usdcToken = currencies.find(
      (currency) => currency.coinDenom.toLowerCase() === "usdc",
    );
    if (!usdcToken) {
      console.warn("No USDC token found in currencies");
      return;
    }
    if (!nativeToken) {
      console.warn("No native token found in currencies");
      return;
    }

    void getQuote(
      TRADE_TYPE.EXACT_IN,
      { token: nativeToken, value: nativeTokenBalance.value },
      { token: usdcToken, value: "" },
    );
  }, [currencies, getQuote, nativeToken, nativeTokenBalance]);

  const usdcToNativeQuote = quote
    ? {
        value: formatNumber(parseFloat(quote.quoteDecimals), {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        symbol: "usdc",
      }
    : {
        value: "0",
        symbol: "usdc",
      };

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
