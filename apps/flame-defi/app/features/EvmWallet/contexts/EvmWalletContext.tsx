import { useConnectModal } from "@rainbow-me/rainbowkit";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Chain, erc20Abi, formatUnits } from "viem";
import {
  useAccount,
  useBalance,
  useConfig,
  useDisconnect,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { getPublicClient } from "@wagmi/core";
import { DropdownOption } from "@repo/ui/components";
import {
  getFlameChainId,
  getFlameNetworkByChainId,
  useConfig as useAppConfig,
  useEvmChainData,
} from "config";
import { useBalancePolling } from "features/GetBalancePolling";

import {
  type AstriaErc20WithdrawerService,
  createWithdrawerService,
} from "../services/AstriaWithdrawerService/AstriaWithdrawerService";
import { formatBalance } from "@repo/ui/utils";
import {
  EvmChainInfo,
  evmChainToRainbowKitChain,
  EvmCurrency,
  evmCurrencyBelongsToChain,
} from "@repo/flame-types";
import JSBI from "jsbi";

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
  tokenAllowances: { symbol: string; allowance: JSBI }[];
  getTokenAllowances: () => void;
  approveToken: (
    token: EvmCurrency | null | undefined,
  ) => Promise<`0x${string}` | null>;
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
    evmChains,
    selectedFlameNetwork,
    selectFlameNetwork,
    tokenDefaultApprovalAmount,
  } = useAppConfig();

  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const wagmiConfig = useConfig();
  const userAccount = useAccount();
  const { switchChain } = useSwitchChain();
  const { selectedChain } = useEvmChainData();
  const publicClient = getPublicClient(wagmiConfig, {
    chainId: selectedChain?.chainId,
  });
  const { data: walletClient } = useWalletClient();
  const { currencies, contracts } = selectedChain;

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

  const [selectedEvmChain, setSelectedEvmChain] = useState<EvmChainInfo | null>(
    null,
  );
  const [selectedEvmCurrency, setSelectedEvmCurrency] =
    useState<EvmCurrency | null>(null);
  const [evmAccountAddress, setEvmAccountAddress] = useState<string | null>(
    null,
  );

  const [tokenAllowances, setTokenAllowances] = useState<
    { symbol: string; allowance: JSBI }[]
  >([]);

  // set the address when the address, chain, or currency changes
  useEffect(() => {
    if (selectedEvmChain && selectedEvmCurrency && userAccount?.address) {
      setEvmAccountAddress(userAccount.address);
    }
  }, [userAccount.address, selectedEvmChain, selectedEvmCurrency]);

  useEffect(() => {
    if (!userAccount?.chainId) {
      return;
    }
    const network = getFlameNetworkByChainId(userAccount.chainId);
    selectFlameNetwork(network);
  }, [selectFlameNetwork, userAccount.chainId]);

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
      const balanceStr = formatBalance(
        balanceRes.toString(),
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
      label: selectedEvmChain?.chainName || "",
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
    return evmCurrencyOptions[0] || undefined;
  }, [evmCurrencyOptions]);

  const selectEvmCurrency = useCallback((currency: EvmCurrency) => {
    setSelectedEvmCurrency(currency);
  }, []);

  const connectEvmWallet = useCallback(() => {
    if (!selectedEvmChain) {
      setSelectedEvmChain(evmChainsOptions[0]?.value || null);
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
    async (token: EvmCurrency | null | undefined) => {
      if (
        !userAccount.address ||
        !walletClient ||
        !contracts?.swapRouter?.address
      ) {
        return null;
      }
      const amountAsBigInt = BigInt(tokenDefaultApprovalAmount);
      // NOTE: Reset this to 0 whenever we want to reset the approval
      // const amountAsBigInt = BigInt('0');

      try {
        const txHash = await walletClient.writeContract({
          address: token?.erc20ContractAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [contracts.swapRouter.address, amountAsBigInt],
          chain: evmChainToRainbowKitChain(selectedChain) as Chain,
          account: userAccount?.address as `0x${string}`,
        });

        const newTokenAllowance = tokenAllowances.map((data) => {
          if (data.symbol === token?.coinDenom) {
            return {
              symbol: token?.coinDenom,
              allowance: JSBI.BigInt(tokenDefaultApprovalAmount),
            };
          }
          return data;
        });
        setTokenAllowances(newTokenAllowance);

        return txHash;
      } catch (error) {
        console.warn("Failed to approve token:", error);
        return null;
      }
    },
    [
      userAccount.address,
      walletClient,
      contracts?.swapRouter?.address,
      tokenAllowances,
      tokenDefaultApprovalAmount,
      selectedChain,
    ],
  );

  const getTokenAllowances = useCallback(async () => {
    if (
      !userAccount.address ||
      !publicClient ||
      !contracts?.swapRouter?.address
    ) {
      return;
    }
    const newTokenAllowances: { symbol: string; allowance: JSBI }[] = [];

    for (const currency of currencies) {
      if (currency.erc20ContractAddress) {
        const tokenAddress = currency.erc20ContractAddress;
        const currentAllowance = await publicClient.readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "allowance",
          args: [userAccount.address, contracts.swapRouter.address],
        });

        newTokenAllowances.push({
          symbol: currency.coinDenom,
          allowance: JSBI.BigInt(currentAllowance.toString()),
        });
      }
    }

    setTokenAllowances(newTokenAllowances);
  }, [userAccount.address, publicClient, contracts, currencies]);

  useEffect(() => {
    if (userAccount.address && tokenAllowances.length === 0) {
      getTokenAllowances();
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
  };

  return (
    <EvmWalletContext.Provider value={value}>
      {children}
    </EvmWalletContext.Provider>
  );
};
