import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance, useConfig } from "wagmi";

import { Balance, EvmCurrency } from "@repo/flame-types";

import { createErc20Service } from "../services/erc-20-service/erc-20-service";

export const useTokenBalance = (token?: EvmCurrency) => {
  const wagmiConfig = useConfig();
  const { address: userAddress, chainId } = useAccount();
  const { data: nativeBalance } = useBalance({
    address: userAddress,
  });

  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!wagmiConfig || !chainId || !userAddress || !token) {
      return;
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
          chainId,
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
          return;
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
      return;
    } finally {
      setIsLoading(false);
    }
    // FIXME - because the nativeBalance updates periodically, we sort of
    //  get polling for free, but we need to actually implement this correctly
    //  at the calling site. should export fetchBalances again probably
  }, [wagmiConfig, chainId, userAddress, token, nativeBalance]);

  // Fetch balance when parameters change
  useEffect(() => {
    if (userAddress && chainId && token) {
      void fetchBalance();
    }
  }, [userAddress, chainId, token, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
  };
};
