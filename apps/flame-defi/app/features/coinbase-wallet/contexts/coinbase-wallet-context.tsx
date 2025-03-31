import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { DropdownOption } from "components/dropdown";
import {
  getFlameChainId,
  getFlameNetworkByChainId,
  useConfig as useAppConfig,
} from "config";
import { useBalancePolling } from "features/get-balance-polling";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import { formatUnits } from "viem";
import {
  useAccount,
  useBalance,
  useConfig,
  useDisconnect,
  useSwitchChain,
} from "wagmi";

import {
  CoinbaseChainInfo,
  CoinbaseChains,
  EvmCurrency,
  HexString,
} from "@repo/flame-types";

export interface CoinbaseWalletContextProps {
  connectCoinbaseWallet: () => void;
  defaultCoinbaseCurrencyOption: DropdownOption<EvmCurrency> | undefined;
  disconnectCoinbaseWallet: () => void;
  coinbaseAccountAddress: string | null;
  coinbaseChainsOptions: DropdownOption<CoinbaseChainInfo>[];
  coinbaseCurrencyOptions: DropdownOption<EvmCurrency>[];
  coinbaseNativeTokenBalance: { value: string; symbol: string } | null;
  isLoadingCoinbaseNativeTokenBalance: boolean;
  isLoadingSelectedCoinbaseCurrencyBalance: boolean;
  resetState: () => void;
  selectedCoinbaseChain: CoinbaseChainInfo | null;
  selectedCoinbaseChainOption: DropdownOption<CoinbaseChainInfo> | null;
  selectedCoinbaseCurrency: EvmCurrency | null;
  selectedCoinbaseCurrencyBalance: { value: string; symbol: string } | null;
  selectCoinbaseChain: (chain: CoinbaseChainInfo | null) => void;
  selectCoinbaseCurrency: (currency: EvmCurrency) => void;
}

export const CoinbaseWalletContext = React.createContext<CoinbaseWalletContextProps>(
  {} as CoinbaseWalletContextProps,
);

interface CoinbaseWalletProviderProps {
  children: React.ReactNode;
}

export const CoinbaseWalletProvider: React.FC<CoinbaseWalletProviderProps> = ({
  children,
}) => {
  const { coinbaseChains, selectedFlameNetwork, selectFlameNetwork } =
    useAppConfig();
  // Create a ref to use current selectedFlameNetwork value in useEffects without
  // its change triggering the useEffect
  const selectedFlameNetworkRef = useRef(selectedFlameNetwork);

  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const wagmiConfig = useConfig();
  const userAccount = useAccount();
  const { switchChain } = useSwitchChain();
  const { formatNumber } = useIntl();

  const {
    status: nativeBalanceStatus,
    data: nativeBalance,
    isLoading: isLoadingCoinbaseNativeTokenBalance,
  } = useBalance({
    address: userAccount.address,
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

  const [selectedCoinbaseChain, setSelectedCoinbaseChain] = useState<CoinbaseChainInfo | null>(
    null,
  );
  const [selectedCoinbaseCurrency, setSelectedCoinbaseCurrency] =
    useState<EvmCurrency | null>(null);
  const [coinbaseAccountAddress, setCoinbaseAccountAddress] = useState<string | null>(
    null,
  );

  // Set the address when the address, chain, or currency changes
  useEffect(() => {
    if (selectedCoinbaseChain && selectedCoinbaseCurrency && userAccount?.address) {
      setCoinbaseAccountAddress(userAccount.address);
    }
  }, [userAccount.address, selectedCoinbaseChain, selectedCoinbaseCurrency]);

  // Set the selectedFlameNetwork if user switches from their wallet
  useEffect(() => {
    if (!userAccount?.chainId) {
      return;
    }
    try {
      const network = getFlameNetworkByChainId(userAccount.chainId);
      selectFlameNetwork(network);
    } catch (error) {
      console.warn(
        "User selected non Flame chain. Switching to selected Flame chain.",
        error,
      );
      const chainId = getFlameChainId(selectedFlameNetworkRef.current);
      switchChain({ chainId });
    }
  }, [selectFlameNetwork, userAccount.chainId, switchChain]);

  const resetState = useCallback(() => {
    setSelectedCoinbaseChain(null);
    setSelectedCoinbaseCurrency(null);
    setCoinbaseAccountAddress(null);
  }, []);

  // Deselect chain and currency when network is changed and switch chains in wallet
  useEffect(() => {
    if (selectedFlameNetwork) {
      resetState();
      selectedFlameNetworkRef.current = selectedFlameNetwork;
    }
  }, [selectedFlameNetwork, resetState]);

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
    return { value: formattedBalance, symbol: selectedCoinbaseCurrency.coinDenom };
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
      ([chainLabel, chain]): DropdownOption<CoinbaseChainInfo> => ({
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
    } as DropdownOption<CoinbaseChainInfo>;
  }, [selectedCoinbaseChain]);

  const selectCoinbaseChain = useCallback((chain: CoinbaseChainInfo | null) => {
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
