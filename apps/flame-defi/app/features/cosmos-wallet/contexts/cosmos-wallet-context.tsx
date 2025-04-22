import { useChain } from "@cosmos-kit/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import type { SigningStargateClient } from "@cosmjs/stargate";
import { useConfig, useAstriaChainData } from "config";
import { useBalancePolling } from "features/get-balance-polling";

import {
  Balance,
  CosmosChainInfo,
  cosmosChainNameFromId,
  IbcCurrency,
  TRADE_TYPE,
} from "@repo/flame-types";
import { removeNonNumeric } from "@repo/ui/utils";
import { useIntl } from "react-intl";
import { useGetQuote } from "features/evm-wallet";
import { getBalanceFromChain } from "../services/cosmos";

export interface CosmosWalletContextProps {
  connectCosmosWallet: () => void;
  cosmosAccountAddress: string | null;
  cosmosBalance: Balance | null;
  disconnectCosmosWallet: () => void;
  getCosmosSigningClient: () => Promise<SigningStargateClient>;
  isLoadingCosmosBalance: boolean;
  resetState: () => void;
  // TODO - probably don't need this now that there is useBridgeConnections.
  //  will need to refactor how we get balances, but it shouldn't be done here.
  selectedCosmosChain: CosmosChainInfo | null;
  selectedIbcCurrency: IbcCurrency | null;
  selectCosmosChain: (chain: CosmosChainInfo | null) => void;
  selectIbcCurrency: (currency: IbcCurrency) => void;
  usdcToNativeQuote: Balance;
  quoteLoading: boolean;
}

export const CosmosWalletContext =
  React.createContext<CosmosWalletContextProps>({} as CosmosWalletContextProps);

interface CosmosWalletProviderProps {
  children: React.ReactNode;
}

export const CosmosWalletProvider: React.FC<CosmosWalletProviderProps> = ({
  children,
}) => {
  const { formatNumber } = useIntl();
  const { cosmosChains, selectedFlameNetwork } = useConfig();
  const [selectedCosmosChain, setSelectedCosmosChain] =
    useState<CosmosChainInfo | null>(null);
  const [selectedIbcCurrency, setSelectedIbcCurrency] =
    useState<IbcCurrency | null>(null);
  const {
    chain: { currencies },
  } = useAstriaChainData();
  const { quote, loading: quoteLoading, getQuote } = useGetQuote();

  // use first chain as default chain
  const defaultChainId = Object.values(cosmosChains)[0]?.chainId;
  if (!defaultChainId) {
    throw new Error("No cosmos chains provided!");
  }
  const chainName = cosmosChainNameFromId(
    selectedCosmosChain?.chainId || defaultChainId,
  );
  const {
    address: cosmosAddressFromWallet,
    openView: openCosmosWalletModal,
    getSigningStargateClient: getCosmosSigningClient,
    disconnect,
    isWalletConnected,
  } = useChain(chainName);

  // we are keeping track of the address ourselves so that we can clear it if
  // needed, e.g. to allow for manual address entry
  const [cosmosAccountAddress, setCosmosAccountAddress] = useState<
    string | null
  >(null);

  useEffect(() => {
    // make sure the address is set when the address changes
    if (cosmosAddressFromWallet) {
      setCosmosAccountAddress(cosmosAddressFromWallet);
    }
  }, [cosmosAddressFromWallet]);

  const resetState = useCallback(() => {
    setSelectedCosmosChain(null);
    setSelectedIbcCurrency(null);
    setCosmosAccountAddress(null);
  }, []);

  const getBalanceCallback = useCallback(async () => {
    if (!selectedCosmosChain || !selectedIbcCurrency || !cosmosAccountAddress) {
      return null;
    }
    if (!selectedIbcCurrency.belongsToChain(selectedCosmosChain)) {
      return null;
    }
    const balance = await getBalanceFromChain(
      selectedCosmosChain,
      selectedIbcCurrency,
      cosmosAccountAddress,
    );

    return { value: balance.toString(), symbol: selectedIbcCurrency.coinDenom };
  }, [selectedCosmosChain, selectedIbcCurrency, cosmosAccountAddress]);

  const pollingConfig = useMemo(
    () => ({
      enabled: !!selectedCosmosChain && !!selectedIbcCurrency,
      intervalMS: 10_000,
      onError: (error: Error) => {
        console.error("Failed to get balance from Keplr", error);
      },
    }),
    [selectedCosmosChain, selectedIbcCurrency],
  );
  const { balance: cosmosBalance, isLoading: isLoadingCosmosBalance } =
    useBalancePolling(getBalanceCallback, pollingConfig);

  useEffect(() => {
    if (!cosmosBalance) {
      return;
    }
    const usdcToken = currencies.find(
      (currency) => currency.coinDenom.toLowerCase() === "usdc",
    );

    if (!usdcToken) {
      console.error("No USDC token found in currencies");
      return;
    }

    const nativeToken = currencies.find((currency) => currency.isNative);

    if (!nativeToken) {
      console.error("No native token found in currencies");
      return;
    }

    getQuote(
      TRADE_TYPE.EXACT_IN,
      { token: nativeToken, value: removeNonNumeric(cosmosBalance.value) },
      { token: usdcToken, value: "" },
    );
  }, [cosmosBalance, getQuote, currencies]);

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

  // deselect chain and currency when network is changed
  useEffect(() => {
    resetState();
    if (selectedFlameNetwork) {
      resetState();
    }
  }, [resetState, selectedFlameNetwork]);

  const selectCosmosChain = useCallback((chain: CosmosChainInfo | null) => {
    setSelectedCosmosChain(chain);
  }, []);

  const selectIbcCurrency = useCallback((currency: IbcCurrency) => {
    setSelectedIbcCurrency(currency);
  }, []);

  // opens CosmosKit modal for user to connect their Cosmos wallet
  const connectCosmosWallet = useCallback(() => {
    // only open modal if not already connected
    if (!isWalletConnected) {
      console.log("opening cosmos wallet modal");
      openCosmosWalletModal();
    }
  }, [openCosmosWalletModal, isWalletConnected]);

  const disconnectCosmosWallet = useCallback(() => {
    disconnect().then(() => {});
    resetState();
  }, [disconnect, resetState]);

  const value = {
    connectCosmosWallet,
    cosmosAccountAddress,
    cosmosBalance,
    getCosmosSigningClient,
    disconnectCosmosWallet,
    isLoadingCosmosBalance,
    resetState,
    selectedCosmosChain,
    selectedIbcCurrency,
    selectCosmosChain,
    selectIbcCurrency,
    usdcToNativeQuote,
    quoteLoading,
  };

  return (
    <CosmosWalletContext.Provider value={value}>
      {children}
    </CosmosWalletContext.Provider>
  );
};
