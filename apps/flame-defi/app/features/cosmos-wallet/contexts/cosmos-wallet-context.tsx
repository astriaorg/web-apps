import { useChain } from "@cosmos-kit/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import type { SigningStargateClient } from "@cosmjs/stargate";
import { DropdownOption } from "@repo/ui/components";
import { useConfig, useEvmChainData } from "config";
import { useBalancePolling } from "features/get-balance-polling";

import {
  CosmosChainInfo,
  cosmosChainNameFromId,
  IbcCurrency,
  ibcCurrencyBelongsToChain,
  TRADE_TYPE,
} from "@repo/flame-types";
import { useIntl } from "@repo/libs/react-intl";
import { removeNonNumeric } from "@repo/ui/utils";
import { useGetQuote } from "../../../hooks";
import { getBalanceFromChain } from "../services/cosmos";
export interface CosmosWalletContextProps {
  connectCosmosWallet: () => void;
  cosmosAccountAddress: string | null;
  cosmosBalance: { value: string; symbol: string } | null;
  cosmosChainsOptions: DropdownOption<CosmosChainInfo>[];
  defaultIbcCurrencyOption: DropdownOption<IbcCurrency> | undefined;
  disconnectCosmosWallet: () => void;
  getCosmosSigningClient: () => Promise<SigningStargateClient>;
  ibcCurrencyOptions: DropdownOption<IbcCurrency>[];
  isLoadingCosmosBalance: boolean;
  resetState: () => void;
  selectedCosmosChain: CosmosChainInfo | null;
  selectedCosmosChainOption: DropdownOption<CosmosChainInfo> | null;
  selectedIbcCurrency: IbcCurrency | null;
  selectCosmosChain: (chain: CosmosChainInfo | null) => void;
  selectIbcCurrency: (currency: IbcCurrency) => void;
  usdcToNativeQuote: { value: string; symbol: string };
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
    selectedChain: { currencies },
  } = useEvmChainData();
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
    // make sure the address is set when
    // the address, chain, or currency change
    if (selectedCosmosChain && selectedIbcCurrency && cosmosAddressFromWallet) {
      setCosmosAccountAddress(cosmosAddressFromWallet);
    }
  }, [cosmosAddressFromWallet, selectedCosmosChain, selectedIbcCurrency]);

  const resetState = useCallback(() => {
    setSelectedCosmosChain(null);
    setSelectedIbcCurrency(null);
    setCosmosAccountAddress(null);
  }, []);

  const getBalanceCallback = useCallback(async () => {
    if (!selectedCosmosChain || !selectedIbcCurrency || !cosmosAccountAddress) {
      return null;
    }
    if (!ibcCurrencyBelongsToChain(selectedIbcCurrency, selectedCosmosChain)) {
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

  const cosmosChainsOptions = useMemo(() => {
    return Object.entries(cosmosChains).map(
      ([chainLabel, chain]): DropdownOption<CosmosChainInfo> => ({
        label: chainLabel,
        value: chain,
        LeftIcon: chain.IconComponent,
      }),
    );
  }, [cosmosChains]);

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

  const ibcCurrencyOptions = useMemo(() => {
    if (!selectedCosmosChain) {
      return [];
    }
    return selectedCosmosChain.currencies?.map(
      (currency): DropdownOption<IbcCurrency> => ({
        label: currency.coinDenom,
        value: currency,
        LeftIcon: currency.IconComponent,
      }),
    );
  }, [selectedCosmosChain]);

  const defaultIbcCurrencyOption = useMemo(() => {
    return ibcCurrencyOptions[0] || undefined;
  }, [ibcCurrencyOptions]);

  // selectedCosmosChainOption allows us to ensure the label is set properly
  // in the dropdown when connecting via an "additional option"s action,
  //  e.g. the "Connect Keplr Wallet" option in the dropdown
  const selectedCosmosChainOption = useMemo(() => {
    if (!selectedCosmosChain) {
      return null;
    }
    return {
      label: selectedCosmosChain?.chainName || "",
      value: selectedCosmosChain,
      LeftIcon: selectedCosmosChain?.IconComponent,
    } as DropdownOption<CosmosChainInfo>;
  }, [selectedCosmosChain]);

  const selectIbcCurrency = useCallback((currency: IbcCurrency) => {
    setSelectedIbcCurrency(currency);
  }, []);

  // opens CosmosKit modal for user to connect their Cosmos wallet
  const connectCosmosWallet = useCallback(() => {
    // if no chain is set, set the first one and return
    // FIXME - the caller has to to re-trigger the connect function
    //  by watching the selectedEvmChain value. this is a foot gun for sure.
    if (!selectedCosmosChain) {
      // FIXME - just doing || null to get past type issues while refactoring into nextjs app
      selectCosmosChain(cosmosChainsOptions[0]?.value || null);
      return;
    }

    // if already connected, don't open modal
    if (!isWalletConnected) {
      console.log("opening cosmos wallet modal");
      openCosmosWalletModal();
    }
  }, [
    selectCosmosChain,
    selectedCosmosChain,
    cosmosChainsOptions,
    openCosmosWalletModal,
    isWalletConnected,
  ]);

  const disconnectCosmosWallet = useCallback(() => {
    disconnect().then(() => {});
    resetState();
  }, [disconnect, resetState]);

  const value = {
    connectCosmosWallet,
    cosmosAccountAddress,
    cosmosBalance,
    cosmosChainsOptions,
    defaultIbcCurrencyOption,
    getCosmosSigningClient,
    disconnectCosmosWallet,
    ibcCurrencyOptions,
    isLoadingCosmosBalance,
    resetState,
    selectedCosmosChain,
    selectedCosmosChainOption,
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
