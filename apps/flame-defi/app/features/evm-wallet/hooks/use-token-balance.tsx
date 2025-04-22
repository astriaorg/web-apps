import {
  Balance,
  EvmChainInfo,
  EvmCurrency,
  HexString,
} from "@repo/flame-types";
import { createErc20Service } from "../services/erc-20-service/erc-20-service";
import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useBalance, useConfig } from "wagmi";

export const useTokenBalance = (
  userAddress?: HexString,
  evmChain?: EvmChainInfo,
  token?: EvmCurrency,
) => {
  const wagmiConfig = useConfig();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { data: nativeBalance } = useBalance({
    address: userAddress as HexString,
  });

  const fetchBalance = useCallback(async () => {
    if (!wagmiConfig || !evmChain || !userAddress || !token) {
      return null;
    }

    setIsLoading(true);

    try {
      if (token.erc20ContractAddress) {
        // For ERC20 tokens
        const erc20Service = createErc20Service(
          wagmiConfig,
          token.erc20ContractAddress,
        );

        const balanceRes = await erc20Service.getBalance(
          evmChain.chainId,
          userAddress as string,
        );

        const balanceStr = formatUnits(balanceRes, token.coinDecimals);

        const result = {
          value: balanceStr,
          symbol: token.coinDenom,
        };

        setBalance(result);
        return result;
      } else {
        // For native tokens
        if (!nativeBalance?.value) {
          setBalance(null);
          return null;
        }

        const balanceStr = formatUnits(
          nativeBalance.value,
          nativeBalance.decimals,
        );

        const result = {
          value: balanceStr,
          symbol: token.coinDenom,
        };

        setBalance(result);
        return result;
      }
    } catch (e) {
      const errorObj =
        e instanceof Error ? e : new Error("Failed to fetch balance.");
      setError(errorObj);
      return null;
    } finally {
      setIsLoading(false);
    }
    // NOTE - because the nativeBalance updates periodically, we sort of
    //  get polling for free, but we need to actually implement this correctly
    //  at the calling site. should export fetchBalances again probably
  }, [wagmiConfig, evmChain, userAddress, token, nativeBalance]);

  // Fetch balance when parameters change
  useEffect(() => {
    if (userAddress && evmChain && token) {
      void fetchBalance();
    }
  }, [userAddress, evmChain, token, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
  };
};
