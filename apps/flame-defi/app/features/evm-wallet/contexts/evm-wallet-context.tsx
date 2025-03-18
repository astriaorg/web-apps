import { useConnectModal } from "@rainbow-me/rainbowkit";
import { DropdownOption } from "components/dropdown";
import {
  getFlameChainId,
  getFlameNetworkByChainId,
  useConfig as useAppConfig,
  useEvmChainData,
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
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useConfig,
  useDisconnect,
  useSwitchChain,
} from "wagmi";

import {
  EvmChainInfo,
  EvmCurrency,
  evmCurrencyBelongsToChain,
  TokenAllowance,
  TRADE_TYPE,
} from "@repo/flame-types";
import { useGetQuote } from "../../../hooks";
import {
  type AstriaErc20WithdrawerService,
  createWithdrawerService,
} from "../services/astria-withdrawer-service/astria-withdrawer-service";
import { createErc20Service } from "../services/erc-20-service/erc-20-service";

export interface EvmWalletContextProps {
  connectEvmWallet: () => void;
  defaultEvmCurrencyOption: DropdownOption<EvmCurrency> | undefined;
  disconnectEvmWallet: () => void;
  evmAccountAddress: string | null;
  evmChainsOptions: DropdownOption<EvmChainInfo>[];
  evmCurrencyOptions: DropdownOption<EvmCurrency>[];
  evmNativeTokenBalance: { value: string; symbol: string } | null;
  isLoadingEvmNativeTokenBalance: boolean;
  isLoadingSelectedEvmCurrencyBalance: boolean;
  resetState: () => void;
  selectedEvmChain: EvmChainInfo | null;
  selectedEvmChainNativeToken: EvmCurrency | undefined;
  selectedEvmChainOption: DropdownOption<EvmChainInfo> | null;
  selectedEvmCurrency: EvmCurrency | null;
  selectedEvmCurrencyBalance: { value: string; symbol: string } | null;
  selectEvmChain: (chain: EvmChainInfo | null) => void;
  selectEvmCurrency: (currency: EvmCurrency) => void;
  withdrawFeeDisplay: string;
  tokenAllowances: TokenAllowance[];
  getTokenAllowances: () => void;
  approveToken: (
    token: EvmCurrency,
    value: string,
  ) => Promise<`0x${string}` | null>;
  usdcToNativeQuote: { value: string; symbol: string };
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
  const { evmChains, selectedFlameNetwork, selectFlameNetwork } =
    useAppConfig();
  // creating a ref here to use current selectedFlameNetwork value in useEffects without
  // its change triggering the useEffect
  const selectedFlameNetworkRef = useRef(selectedFlameNetwork);

  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const wagmiConfig = useConfig();
  const userAccount = useAccount();
  const { switchChain } = useSwitchChain();
  const { selectedChain } = useEvmChainData();
  const { currencies, contracts } = selectedChain;
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

  const [tokenAllowances, setTokenAllowances] = useState<TokenAllowance[]>([]);

  // set the address when the address, chain, or currency changes
  useEffect(() => {
    if (selectedEvmChain && selectedEvmCurrency && userAccount?.address) {
      setEvmAccountAddress(userAccount.address);
    }
  }, [userAccount.address, selectedEvmChain, selectedEvmCurrency]);

  // set the selectedFlameNetwork if user switches from their wallet
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
    setSelectedEvmChain(null);
    setSelectedEvmCurrency(null);
    setEvmAccountAddress(null);
  }, []);

  // deselect chain and currency when network is changed and switch chains in wallet
  useEffect(() => {
    if (selectedFlameNetwork) {
      resetState();
      const chainId = getFlameChainId(selectedFlameNetwork);
      switchChain({ chainId });
      selectedFlameNetworkRef.current = selectedFlameNetwork;
    }
  }, [selectedFlameNetwork, switchChain, resetState]);

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
    return selectedEvmChain?.currencies[0];
  }, [selectedEvmChain]);

  const withdrawFeeDisplay = useMemo(() => {
    if (!selectedEvmChainNativeToken || !selectedEvmCurrency) {
      return "";
    }

    const fee = formatUnits(
      BigInt(selectedEvmCurrency.ibcWithdrawalFeeWei),
      18,
    );
    return `${fee} ${selectedEvmChainNativeToken.coinDenom}`;
  }, [selectedEvmChainNativeToken, selectedEvmCurrency]);

  const evmChainsOptions = useMemo(() => {
    return Object.entries(evmChains).map(
      ([chainLabel, chain]): DropdownOption<EvmChainInfo> => ({
        label: chainLabel,
        value: chain,
        LeftIcon: chain.IconComponent,
      }),
    );
  }, [evmChains]);

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
    setSelectedEvmChain(chain);
  }, []);

  const evmCurrencyOptions = useMemo(() => {
    if (!selectedEvmChain) {
      return [];
    }

    const withdrawableTokens = selectedEvmChain.currencies?.filter(
      (currency) =>
        currency.erc20ContractAddress ||
        currency.nativeTokenWithdrawerContractAddress,
    );

    return withdrawableTokens.map(
      (currency): DropdownOption<EvmCurrency> => ({
        label: currency.coinDenom,
        value: currency,
        LeftIcon: currency.IconComponent,
      }),
    );
  }, [selectedEvmChain]);

  const defaultEvmCurrencyOption = useMemo(() => {
    return evmCurrencyOptions[0] ?? undefined;
  }, [evmCurrencyOptions]);

  const selectEvmCurrency = useCallback((currency: EvmCurrency) => {
    setSelectedEvmCurrency(currency);
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

  const disconnectEvmWallet = useCallback(() => {
    disconnect();
    resetState();
  }, [disconnect, resetState]);

  const approveToken = useCallback(
    async (token: EvmCurrency, value: string) => {
      if (
        !wagmiConfig ||
        !contracts?.swapRouter.address ||
        !currencies ||
        !selectedChain.chainId ||
        !token?.erc20ContractAddress
      ) {
        return null;
      }
      const erc20Service = createErc20Service(
        wagmiConfig,
        token.erc20ContractAddress as `0x${string}`,
      );

      const txHash = await erc20Service.approveToken(
        selectedChain.chainId,
        contracts.swapRouter.address,
        value,
        token.coinDecimals,
      );

      const newTokenAllowances = tokenAllowances.map((data) => {
        if (data.symbol === token.coinDenom) {
          return {
            symbol: token.coinDenom,
            value: parseUnits(value, token.coinDecimals).toString(),
          };
        }
        return data;
      });

      setTokenAllowances(newTokenAllowances);

      return txHash;
    },
    [
      wagmiConfig,
      contracts?.swapRouter.address,
      currencies,
      selectedChain,
      tokenAllowances,
    ],
  );

  const getTokenAllowances = useCallback(async () => {
    if (
      !userAccount.address ||
      !wagmiConfig ||
      !contracts?.swapRouter.address ||
      !currencies ||
      !selectedChain.chainId
    ) {
      return;
    }
    const newTokenAllowances: TokenAllowance[] = [];
    for (const currency of currencies) {
      if (currency.erc20ContractAddress) {
        const erc20Service = createErc20Service(
          wagmiConfig,
          currency.erc20ContractAddress as `0x${string}`,
        );
        try {
          const allowance = await erc20Service.getTokenAllowance(
            selectedChain.chainId,
            userAccount.address,
            contracts.swapRouter.address,
          );

          newTokenAllowances.push({
            symbol: currency.coinDenom,
            value: allowance ?? "0",
          });
        } catch (error) {
          console.warn("Failed to get token allowance:", error);
        }
      }
    }

    setTokenAllowances(newTokenAllowances);
  }, [userAccount.address, contracts, currencies, selectedChain, wagmiConfig]);

  useEffect(() => {
    if (userAccount.address && tokenAllowances.length === 0) {
      void getTokenAllowances();
    }
  }, [getTokenAllowances, userAccount.address, tokenAllowances]);

  const value = {
    connectEvmWallet,
    defaultEvmCurrencyOption,
    disconnectEvmWallet,
    evmAccountAddress,
    evmChainsOptions,
    evmCurrencyOptions,
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
    selectEvmCurrency,
    withdrawFeeDisplay,
    getTokenAllowances,
    approveToken,
    tokenAllowances,
    usdcToNativeQuote,
    quoteLoading,
  };

  return (
    <EvmWalletContext.Provider value={value}>
      {children}
    </EvmWalletContext.Provider>
  );
};
