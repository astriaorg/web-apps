import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useConfig as useAppConfig, useAstriaChainData } from "config";
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
  connectEvmWallet: (chain?: EvmChainInfo) => void;
  connectToSpecificChain: (chainId: number) => void;
  disconnectEvmWallet: () => void;
  evmAccountAddress: string | null;
  astriaChains: AstriaChain[];
  coinbaseChains: EvmChainInfo[];
  // FIXME - can probably refactor all this junk out of here,
  //  but it is still used to show the balance in the bridge-connections-modal,
  //  but even that needs to be refactored to show Base balances possibly
  evmNativeTokenBalance: Balance | null;
  isLoadingEvmNativeTokenBalance: boolean;
  isLoadingSelectedEvmCurrencyBalance: boolean;
  resetState: () => void;
  selectedEvmChain: EvmChainInfo | null;
  selectedEvmChainNativeToken?: EvmCurrency;
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
  const { astriaChains, coinbaseChains } = useAppConfig();

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
      setEvmAccountAddress(userAccount.address);
    }
  }, [userAccount.address]);

  const resetState = useCallback(() => {
    console.log("EVM wallet state reset called");
    setSelectedEvmChain(null);
    setSelectedEvmCurrency(null);
    setEvmAccountAddress(null);
  }, []);

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

  // TODO - move to withdraw content-section
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

  const selectEvmChain = useCallback((chain: EvmChainInfo | null) => {
    console.log("EVM chain selected:", chain?.chainName, chain?.chainType);
    setSelectedEvmChain(chain);
  }, []);

  const connectEvmWallet = useCallback(
    (chain?: EvmChainInfo) => {
      if (!selectedEvmChain && chain) {
        setSelectedEvmChain(chain);
        if (openConnectModal) {
          openConnectModal();
        }
        return;
      }

      if (openConnectModal) {
        openConnectModal();
      }
    },
    [selectedEvmChain, openConnectModal],
  );

  const connectToSpecificChain = (chainId: number) => {
    if (!evmAccountAddress && openConnectModal) {
      openConnectModal();
    } else if (!evmAccountAddress) {
      switchChain({ chainId });
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
