import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { DropdownOption } from "components/dropdown";
import { useConfig as useAppConfig } from "config";
import { useBalancePolling } from "features/get-balance-polling";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance, useConfig, useDisconnect } from "wagmi";

import { CoinbaseChain, EvmCurrency } from "@repo/flame-types";

export interface CoinbaseWalletContextProps {
  connectCoinbaseWallet: () => void;
  defaultCoinbaseCurrencyOption: DropdownOption<EvmCurrency> | undefined;
  disconnectCoinbaseWallet: () => void;
  coinbaseAccountAddress: string | null;
  coinbaseChainsOptions: DropdownOption<CoinbaseChain>[];
  coinbaseCurrencyOptions: DropdownOption<EvmCurrency>[];
  coinbaseNativeTokenBalance: { value: string; symbol: string } | null;
  isLoadingCoinbaseNativeTokenBalance: boolean;
  isLoadingSelectedCoinbaseCurrencyBalance: boolean;
  resetState: () => void;
  selectedCoinbaseChain: CoinbaseChain | null;
  selectedCoinbaseChainOption: DropdownOption<CoinbaseChain> | null;
  selectedCoinbaseCurrency: EvmCurrency | null;
  selectedCoinbaseCurrencyBalance: { value: string; symbol: string } | null;
  selectCoinbaseChain: (chain: CoinbaseChain | null) => void;
  selectCoinbaseCurrency: (currency: EvmCurrency) => void;
}

export const CoinbaseWalletContext =
  React.createContext<CoinbaseWalletContextProps>(
    {} as CoinbaseWalletContextProps,
  );

interface CoinbaseWalletProviderProps {
  children: React.ReactNode;
}

export const CoinbaseWalletProvider: React.FC<CoinbaseWalletProviderProps> = ({
  children,
}) => {
  const { coinbaseChains } = useAppConfig();

  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const wagmiConfig = useConfig();
  const userAccount = useAccount();

  const [coinbaseAccountAddress, setCoinbaseAccountAddress] = useState<
    string | null
  >(null);

  // TODO - move this state to probably a deposit only context, or maybe just deposit-card for now
  const [selectedCoinbaseChain, setSelectedCoinbaseChain] =
    useState<CoinbaseChain | null>(null);
  const [selectedCoinbaseCurrency, setSelectedCoinbaseCurrency] =
    useState<EvmCurrency | null>(null);

  const {
    status: nativeBalanceStatus,
    data: nativeBalance,
    isLoading: isLoadingCoinbaseNativeTokenBalance,
  } = useBalance({
    chainId: selectedCoinbaseChain?.chainId,
    address: userAccount.address,
  });

  console.log({
    isLoadingCoinbaseNativeTokenBalance,
    nativeBalanceStatus,
    nativeBalance,
  });

  const coinbaseNativeTokenBalance = useMemo(() => {
    if (nativeBalanceStatus !== "success") {
      return null;
    }
    const formattedBalance = formatUnits(
      nativeBalance.value,
      nativeBalance.decimals,
    );

    return { value: formattedBalance, symbol: nativeBalance.symbol };
  }, [nativeBalance, nativeBalanceStatus]);

  // Set the address when the address, chain, or currency changes
  useEffect(() => {
    if (
      selectedCoinbaseChain &&
      selectedCoinbaseCurrency &&
      userAccount?.address
    ) {
      setCoinbaseAccountAddress(userAccount.address);
    }
  }, [userAccount.address, selectedCoinbaseChain, selectedCoinbaseCurrency]);

  const resetState = useCallback(() => {
    setSelectedCoinbaseChain(null);
    setSelectedCoinbaseCurrency(null);
    setCoinbaseAccountAddress(null);
  }, []);

  // Polling get balance
  const getBalanceCallback = useCallback(async () => {
    if (
      !wagmiConfig ||
      !selectedCoinbaseChain ||
      !selectedCoinbaseCurrency ||
      !coinbaseAccountAddress
    ) {
      return null;
    }

    // For ERC20 tokens
    if (selectedCoinbaseCurrency.erc20ContractAddress) {
      // TODO: Implement ERC20 balance checking for Base
      return null;
    }

    if (!nativeBalance?.value) return null;
    const formattedBalance = formatUnits(
      nativeBalance.value,
      nativeBalance.decimals,
    );
    return {
      value: formattedBalance,
      symbol: selectedCoinbaseCurrency.coinDenom,
    };
  }, [
    wagmiConfig,
    nativeBalance?.value,
    nativeBalance?.decimals,
    selectedCoinbaseChain,
    selectedCoinbaseCurrency,
    coinbaseAccountAddress,
  ]);

  const pollingConfig = useMemo(
    () => ({
      enabled: !!selectedCoinbaseChain && !!selectedCoinbaseCurrency,
      intervalMS: 10_000,
      onError: (error: Error) => {
        console.error("Failed to get balance:", error);
      },
    }),
    [selectedCoinbaseChain, selectedCoinbaseCurrency],
  );

  const {
    balance: selectedCoinbaseCurrencyBalance,
    isLoading: isLoadingSelectedCoinbaseCurrencyBalance,
  } = useBalancePolling(getBalanceCallback, pollingConfig);

  const coinbaseChainsOptions = useMemo(() => {
    return Object.entries(coinbaseChains).map(
      ([chainLabel, chain]): DropdownOption<CoinbaseChain> => ({
        label: chainLabel,
        value: chain,
        LeftIcon: chain.IconComponent,
      }),
    );
  }, [coinbaseChains]);

  const selectedCoinbaseChainOption = useMemo(() => {
    if (!selectedCoinbaseChain) {
      return null;
    }
    return {
      label: selectedCoinbaseChain?.chainName ?? "",
      value: selectedCoinbaseChain,
      LeftIcon: selectedCoinbaseChain?.IconComponent,
    } as DropdownOption<CoinbaseChain>;
  }, [selectedCoinbaseChain]);

  const selectCoinbaseChain = useCallback((chain: CoinbaseChain | null) => {
    setSelectedCoinbaseChain(chain);
  }, []);

  const coinbaseCurrencyOptions = useMemo(() => {
    if (!selectedCoinbaseChain) {
      return [];
    }

    return selectedCoinbaseChain.currencies.map(
      (currency): DropdownOption<EvmCurrency> => ({
        label: currency.coinDenom,
        value: currency,
        LeftIcon: currency.IconComponent,
      }),
    );
  }, [selectedCoinbaseChain]);

  const defaultCoinbaseCurrencyOption = useMemo(() => {
    return coinbaseCurrencyOptions[0] ?? undefined;
  }, [coinbaseCurrencyOptions]);

  const selectCoinbaseCurrency = useCallback((currency: EvmCurrency) => {
    setSelectedCoinbaseCurrency(currency);
  }, []);

  const connectCoinbaseWallet = useCallback(() => {
    if (!selectedCoinbaseChain) {
      setSelectedCoinbaseChain(coinbaseChainsOptions[0]?.value ?? null);
      if (openConnectModal) {
        openConnectModal();
      }
      return;
    }

    if (openConnectModal) {
      openConnectModal();
    }
  }, [selectedCoinbaseChain, openConnectModal, coinbaseChainsOptions]);

  const disconnectCoinbaseWallet = useCallback(() => {
    disconnect();
    resetState();
  }, [disconnect, resetState]);

  const value = {
    connectCoinbaseWallet,
    defaultCoinbaseCurrencyOption,
    disconnectCoinbaseWallet,
    coinbaseAccountAddress,
    coinbaseChainsOptions,
    coinbaseCurrencyOptions,
    coinbaseNativeTokenBalance,
    isLoadingCoinbaseNativeTokenBalance,
    isLoadingSelectedCoinbaseCurrencyBalance,
    resetState,
    selectedCoinbaseChain,
    selectedCoinbaseChainOption,
    selectedCoinbaseCurrency,
    selectedCoinbaseCurrencyBalance,
    selectCoinbaseChain,
    selectCoinbaseCurrency,
  };

  return (
    <CoinbaseWalletContext.Provider value={value}>
      {children}
    </CoinbaseWalletContext.Provider>
  );
};
