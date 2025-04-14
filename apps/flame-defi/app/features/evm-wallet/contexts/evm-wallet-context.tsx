import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { DropdownOption } from "components/dropdown";
import {
  // getFlameChainId,
  // getFlameNetworkByChainId,
  useConfig as useAppConfig,
  useAstriaChainData,
} from "config";
import { useBalancePolling } from "features/get-balance-polling";
import React, {
  useCallback,
  useEffect,
  useMemo,
  // useRef,
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
  AstriaChain,
  Balance,
  EvmChainInfo,
  EvmCurrency,
  evmCurrencyBelongsToChain,
  TRADE_TYPE,
} from "@repo/flame-types";
import { useGetQuote } from "../hooks/use-get-quote";
import {
  type AstriaErc20WithdrawerService,
  createWithdrawerService,
} from "../services/astria-withdrawer-service/astria-withdrawer-service";

export interface EvmWalletContextProps {
  connectEvmWallet: () => void;
  connectToSpecificChain: (chainId: number) => void;
  disconnectEvmWallet: () => void;
  evmAccountAddress: string | null;
  astriaChains: AstriaChain[];
  coinbaseChains: EvmChainInfo[];
  evmNativeTokenBalance: Balance | null;
  isLoadingEvmNativeTokenBalance: boolean;
  isLoadingSelectedEvmCurrencyBalance: boolean;
  resetState: () => void;
  // FIXME - should i refactor this to only care about Astria connection?
  selectedEvmChain: EvmChainInfo | null;
  selectedEvmChainNativeToken: EvmCurrency | undefined;
  selectedEvmChainOption: DropdownOption<EvmChainInfo> | null;
  selectEvmChain: (chain: EvmChainInfo | null) => void;
  ibcWithdrawFeeDisplay: string;
  usdcToNativeQuote: Balance;
  quoteLoading: boolean;
}

export const EvmWalletContext = React.createContext<EvmWalletContextProps>(
  {} as EvmWalletContextProps,
);

interface EvmWalletProviderProps {
  children: React.ReactNode;
}

export const EvmWalletProvider: React.FC<EvmWalletProviderProps> = ({
  children,
}) => {
  const {
    astriaChains,
    coinbaseChains,
    // selectedFlameNetwork,
    // selectFlameNetwork,
  } = useAppConfig();
  // creating a ref here to use current selectedFlameNetwork value in useEffects without
  // its change triggering the useEffect
  // const selectedFlameNetworkRef = useRef(selectedFlameNetwork);

  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const wagmiConfig = useConfig();
  const userAccount = useAccount();
  const { switchChain } = useSwitchChain();
  const { chain } = useAstriaChainData();
  const { currencies } = chain;
  const { quote, loading: quoteLoading, getQuote } = useGetQuote();
  const { formatNumber } = useIntl();

  const {
    status: nativeBalanceStatus,
    data: nativeBalance,
    isLoading: isLoadingEvmNativeTokenBalance,
  } = useBalance({
    address: userAccount.address,
  });

  // FIXME - this could show a balance for a chain that is not the "selected" chain,
  //  e.g. when a user refreshes the page and the selected chain is not set. tho i guess
  //  when a user selects a chain the balance will be updated, maybe not an issue actually?
  //  it's not an issue right now because there is only flame atm, but this will be an issue
  //  for CosmosWalletContext since there are multiple chains.
  const evmNativeTokenBalance = useMemo(() => {
    if (nativeBalanceStatus !== "success") {
      return null;
    }
    const formattedBalance = formatUnits(
      nativeBalance.value,
      nativeBalance.decimals,
    );

    return { value: formattedBalance, symbol: nativeBalance.symbol };
  }, [nativeBalance, nativeBalanceStatus]);

  useEffect(() => {
    if (!evmNativeTokenBalance) {
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

    void getQuote(
      TRADE_TYPE.EXACT_IN,
      { token: nativeToken, value: evmNativeTokenBalance.value },
      { token: usdcToken, value: "" },
    );
  }, [evmNativeTokenBalance, getQuote, currencies]);

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

  const [selectedEvmChain, setSelectedEvmChain] = useState<EvmChainInfo | null>(
    null,
  );
  const [selectedEvmCurrency, setSelectedEvmCurrency] =
    useState<EvmCurrency | null>(null);
  const [evmAccountAddress, setEvmAccountAddress] = useState<string | null>(
    null,
  );

  // set the address when the address or chain changes
  useEffect(() => {
    if (userAccount?.address) {
      console.log("setEvmAccountAddress");
      setEvmAccountAddress(userAccount.address);
    }
  }, [userAccount.address]);

  // set the selectedFlameNetwork if user switches from their wallet
  // useEffect(() => {
  //   if (!userAccount?.chainId) {
  //     return;
  //   }
  //   try {
  //     const network = getFlameNetworkByChainId(userAccount.chainId);
  //     selectFlameNetwork(network);
  //   } catch (error) {
  //     console.warn(
  //       "User selected non Flame chain. Switching to selected Flame chain.",
  //       error,
  //     );
  //     const chainId = getFlameChainId(selectedFlameNetworkRef.current);
  //     switchChain({ chainId });
  //   }
  // }, [selectFlameNetwork, userAccount.chainId, switchChain]);

  const resetState = useCallback(() => {
    console.log("EVM wallet state reset called");
    setSelectedEvmChain(null);
    setSelectedEvmCurrency(null);
    setEvmAccountAddress(null);
  }, []);

  // deselect chain and currency when network is changed and switch chains in wallet
  // FIXME - no longer correct ux, because user can connect to other evm chains for deposit source
  // useEffect(() => {
  //   if (selectedFlameNetwork) {
  //     console.log("Flame network changed, resetting state and switching chains",
  //       selectedFlameNetwork,
  //       "Current chain:", selectedEvmChain?.chainName);
  //     resetState();
  //     const chainId = getFlameChainId(selectedFlameNetwork);
  //     switchChain({ chainId });
  //     selectedFlameNetworkRef.current = selectedFlameNetwork;
  //   }
  // }, [selectedFlameNetwork, switchChain, resetState, selectedEvmChain]);

  // polling get balance
  const getBalanceCallback = useCallback(async () => {
    if (
      !wagmiConfig ||
      !selectedEvmChain ||
      !selectedEvmCurrency ||
      !evmAccountAddress
    ) {
      return null;
    }
    if (!evmCurrencyBelongsToChain(selectedEvmCurrency, selectedEvmChain)) {
      return null;
    }

    // for ERC20 tokens, call the contract
    if (selectedEvmCurrency.erc20ContractAddress) {
      const withdrawerSvc = createWithdrawerService(
        wagmiConfig,
        selectedEvmCurrency.erc20ContractAddress,
        true,
      ) as AstriaErc20WithdrawerService;

      const balanceRes = await withdrawerSvc.getBalance(
        selectedEvmChain.chainId,
        evmAccountAddress,
      );
      const balanceStr = formatUnits(
        balanceRes,
        selectedEvmCurrency.coinDecimals,
      );
      return {
        value: balanceStr.toString(),
        symbol: selectedEvmCurrency.coinDenom,
      };
    }

    if (!nativeBalance?.value) return null;
    const formattedBalance = formatUnits(
      nativeBalance.value,
      nativeBalance.decimals,
    );
    return { value: formattedBalance, symbol: selectedEvmCurrency.coinDenom };
  }, [
    wagmiConfig,
    nativeBalance?.value,
    nativeBalance?.decimals,
    selectedEvmChain,
    selectedEvmCurrency,
    evmAccountAddress,
  ]);
  const pollingConfig = useMemo(
    () => ({
      enabled: !!selectedEvmChain && !!selectedEvmCurrency,
      intervalMS: 10_000,
      onError: (error: Error) => {
        console.error("Failed to get balance:", error);
      },
    }),
    [selectedEvmChain, selectedEvmCurrency],
  );

  const {
    balance: selectedEvmCurrencyBalance,
    isLoading: isLoadingSelectedEvmCurrencyBalance,
  } = useBalancePolling(getBalanceCallback, pollingConfig);

  const selectedEvmChainNativeToken = useMemo(() => {
    return selectedEvmChain?.currencies.find((currency) => currency.isNative);
  }, [selectedEvmChain]);

  // TODO - move to deposit-page-context
  const ibcWithdrawFeeDisplay = useMemo(() => {
    if (
      !selectedEvmChainNativeToken ||
      !selectedEvmCurrency?.ibcWithdrawalFeeWei
    ) {
      return "";
    }

    const fee = formatUnits(
      BigInt(selectedEvmCurrency.ibcWithdrawalFeeWei),
      18,
    );
    return `${fee} ${selectedEvmChainNativeToken.coinDenom}`;
  }, [selectedEvmChainNativeToken, selectedEvmCurrency]);

  const evmChainsOptions = useMemo(() => {
    return Object.values({ ...astriaChains, ...coinbaseChains }).map(
      (chain): DropdownOption<EvmChainInfo> => ({
        label: chain.chainName,
        value: chain,
        LeftIcon: chain.IconComponent,
      }),
    );
  }, [astriaChains, coinbaseChains]);

  const selectedEvmChainOption = useMemo(() => {
    if (!selectedEvmChain) {
      return null;
    }
    return {
      label: selectedEvmChain?.chainName ?? "",
      value: selectedEvmChain,
      LeftIcon: selectedEvmChain?.IconComponent,
    } as DropdownOption<EvmChainInfo>;
  }, [selectedEvmChain]);

  const selectEvmChain = useCallback((chain: EvmChainInfo | null) => {
    console.log("EVM chain selected:", chain?.chainName, chain?.chainType);
    setSelectedEvmChain(chain);
  }, []);

  const connectEvmWallet = useCallback(() => {
    if (!selectedEvmChain) {
      setSelectedEvmChain(evmChainsOptions[0]?.value ?? null);
      if (openConnectModal) {
        openConnectModal();
      }
      return;
    }

    if (openConnectModal) {
      openConnectModal();
    }
  }, [selectedEvmChain, openConnectModal, evmChainsOptions]);

  const connectToSpecificChain = (chainId: number) => {
    if (openConnectModal) {
      switchChain({ chainId });
      openConnectModal();
    }
  };

  const disconnectEvmWallet = useCallback(() => {
    disconnect();
    resetState();
  }, [disconnect, resetState]);

  const value = {
    connectEvmWallet,
    connectToSpecificChain,
    disconnectEvmWallet,
    evmAccountAddress,
    astriaChains: Object.values(astriaChains),
    coinbaseChains: Object.values(coinbaseChains),
    evmNativeTokenBalance,
    isLoadingEvmNativeTokenBalance,
    isLoadingSelectedEvmCurrencyBalance,
    resetState,
    selectedEvmChain,
    selectedEvmChainNativeToken,
    selectedEvmChainOption,
    selectedEvmCurrency,
    selectedEvmCurrencyBalance,
    selectEvmChain,
    ibcWithdrawFeeDisplay,
    usdcToNativeQuote,
    quoteLoading,
  };

  return (
    <EvmWalletContext.Provider value={value}>
      {children}
    </EvmWalletContext.Provider>
  );
};
