import { useConnectModal } from "@rainbow-me/rainbowkit";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useConfig as useWagmiConfig,
  useDisconnect,
} from "wagmi";

import {
  AstriaChain,
  Balance,
  HexString,
  TokenAllowance,
  TokenInputState,
  tokenStateToBig,
  TRADE_TYPE,
} from "@repo/flame-types";
import { useAstriaChainData, useConfig } from "config";
import { useGetQuote } from "hooks";
import { createErc20Service } from "../services/erc-20-service/erc-20-service";

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
  tokenAllowances: TokenAllowance[];
  getTokenAllowances: () => void;
  getTokenNeedingApproval: (
    tokenInputState: TokenInputState,
  ) => TokenInputState | null;
  getMultiTokenNeedingApproval: (
    tokenInputStateOne: TokenInputState,
    tokenInputStateTwo: TokenInputState,
  ) => TokenInputState | null;
  approveToken: (tokenInputState: TokenInputState) => Promise<HexString | null>;
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
  const { currencies, contracts } = chain;
  const { quote, loading: quoteLoading, getQuote } = useGetQuote();
  const { formatNumber } = useIntl();

  const [tokenAllowances, setTokenAllowances] = useState<TokenAllowance[]>([]);

  const wagmiConfig = useWagmiConfig();
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
  } = useBalance({
    address: userAccount.address,
  });

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

  const approveToken = useCallback(
    async (tokenInputState: TokenInputState): Promise<HexString | null> => {
      const token = tokenInputState.token;
      if (
        !token ||
        !wagmiConfig ||
        !contracts?.swapRouter?.address ||
        !currencies ||
        !chain.chainId ||
        !token.erc20ContractAddress
      ) {
        return null;
      }
      const erc20Service = createErc20Service(
        wagmiConfig,
        token.erc20ContractAddress as HexString,
      );

      const txHash = await erc20Service.approveToken(
        chain.chainId,
        contracts.swapRouter.address,
        tokenInputState.value,
        token.coinDecimals,
      );

      const newTokenAllowances = tokenAllowances.map((data) => {
        if (data.symbol === token.coinDenom) {
          return {
            symbol: token.coinDenom,
            value: parseUnits(
              tokenInputState.value,
              token.coinDecimals,
            ).toString(),
          };
        }
        return data;
      });

      setTokenAllowances(newTokenAllowances);

      return txHash;
    },
    [
      wagmiConfig,
      contracts?.swapRouter?.address,
      currencies,
      chain,
      tokenAllowances,
    ],
  );

  const getTokenAllowances = useCallback(async () => {
    if (
      !userAccount.address ||
      !wagmiConfig ||
      !contracts?.swapRouter?.address ||
      !currencies ||
      !chain.chainId
    ) {
      return;
    }
    const newTokenAllowances: TokenAllowance[] = [];
    for (const currency of currencies) {
      if (currency.erc20ContractAddress) {
        const erc20Service = createErc20Service(
          wagmiConfig,
          currency.erc20ContractAddress as HexString,
        );
        try {
          const allowance = await erc20Service.getTokenAllowance(
            chain.chainId,
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
  }, [userAccount.address, contracts, currencies, chain, wagmiConfig]);

  const getTokenNeedingApproval = useCallback(
    (tokenInputState: TokenInputState): TokenInputState | null => {
      const token = tokenInputState.token;

      if (!token) {
        return null;
      }

      const existingAllowance = tokenAllowances.find(
        (allowanceToken) => token.coinDenom === allowanceToken.symbol,
      );

      if (existingAllowance) {
        const tokenInputGreaterThanAllowance = tokenStateToBig(
          tokenInputState,
        ).gt(existingAllowance.value);
        if (tokenInputGreaterThanAllowance) {
          return { token: token, value: tokenInputState.value };
        }
      }

      return null;
    },
    [tokenAllowances],
  );

  const getMultiTokenNeedingApproval = useCallback(
    (
      tokenInputStateOne: TokenInputState,
      tokenInputStateTwo: TokenInputState,
    ): TokenInputState | null => {
      let tokenNeedingApproval = null;
      if (tokenInputStateOne) {
        tokenNeedingApproval = getTokenNeedingApproval(tokenInputStateOne);
      }
      if (tokenInputStateTwo) {
        tokenNeedingApproval = getTokenNeedingApproval(tokenInputStateTwo);
      }

      return tokenNeedingApproval;
    },
    [getTokenNeedingApproval],
  );

  useEffect(() => {
    if (userAccount.address && tokenAllowances.length === 0) {
      void getTokenAllowances();
    }
  }, [getTokenAllowances, userAccount.address, tokenAllowances]);

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
        tokenAllowances,
        getTokenAllowances,
        getTokenNeedingApproval,
        getMultiTokenNeedingApproval,
        approveToken,
        usdcToNativeQuote,
        quoteLoading,
      }}
    >
      {children}
    </AstriaWalletContext.Provider>
  );
};
