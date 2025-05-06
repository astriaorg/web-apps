import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Big from "big.js";
import { useAstriaChainData } from "config";
import { useCallback } from "react";
import { type Address, formatUnits } from "viem";
import { useAccount, useConfig, usePublicClient } from "wagmi";

import { type EvmCurrency } from "@repo/flame-types";
import { createERC20Service } from "features/evm-wallet";

const STALE_TIME_MILLISECONDS = 1000 * 30; // 30 seconds.
const CACHE_TIME_MILLISECONDS = 1000 * 60 * 5; // 5 minutes.

export const useApproveToken = () => {
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const config = useConfig();
  const { address, chainId } = useAccount();
  const { chain } = useAstriaChainData();

  const useTokenAllowance = ({
    token,
    spender,
  }: {
    token?: EvmCurrency;
    spender: Address;
  }) => {
    return useQuery<bigint | null>({
      queryKey: ["useTokenAllowance", token, spender],
      queryFn: async () => {
        if (!address || !chainId || !publicClient || !token || !spender) {
          return null;
        }

        try {
          const tokenAddress = token.isNative
            ? chain.contracts.wrappedNativeToken.address
            : (token.erc20ContractAddress as Address);

          const erc20Service = createERC20Service(config, tokenAddress);

          const allowance = await erc20Service.allowance(
            chainId,
            address,
            spender,
          );

          return allowance;
        } catch (error) {
          console.error("Error checking token allowance:", error);
        }

        return null;
      },
      enabled: !!address && !!chainId && !!publicClient && !!token && !!spender,
      staleTime: STALE_TIME_MILLISECONDS,
      gcTime: CACHE_TIME_MILLISECONDS,
    });
  };

  const useIsTokenApproved = ({
    token,
    spender,
    amount,
  }: {
    token?: EvmCurrency;
    spender: Address;
    amount: string;
  }) => {
    const { data: allowance } = useTokenAllowance({
      token,
      spender,
    });

    return useQuery({
      queryKey: [
        "useIsTokenApproved",
        token,
        spender,
        amount,
        allowance?.toString(),
      ],
      queryFn: async () => {
        if (
          !address ||
          !chainId ||
          !publicClient ||
          !token ||
          !spender ||
          !amount
        ) {
          return false;
        }

        // TODO: Check if native tokens need approval.
        if (token.isNative) {
          return true;
        }

        if (!allowance) {
          return false;
        }

        const formattedAllowance = formatUnits(allowance, token.coinDecimals);

        return new Big(formattedAllowance).gte(amount);
      },
      enabled: !!token && !!spender && !!amount,
      staleTime: STALE_TIME_MILLISECONDS,
      gcTime: CACHE_TIME_MILLISECONDS,
    });
  };

  const mutation = useMutation({
    mutationFn: async ({
      token,
      spender,
      amount,
    }: {
      token: EvmCurrency;
      spender: Address;
      amount: string;
    }) => {
      if (!address || !chainId || !publicClient) {
        throw new Error("Wallet not connected.");
      }

      if (token.isNative) {
        return null; // TODO: Check if native tokens need approval.
      }

      const tokenAddress = token.isNative
        ? chain.contracts.wrappedNativeToken.address
        : (token.erc20ContractAddress as Address);

      const erc20Service = createERC20Service(config, tokenAddress);

      const hash = await erc20Service.approve(chainId, spender, amount);

      return hash;
    },
    onSuccess: (hash, variables) => {
      // Invalidate relevant queries after successful approval.
      if (!hash) {
        return;
      }

      queryClient.invalidateQueries({
        // TODO: Add allowance query key.
        queryKey: ["useTokenAllowance", variables.token, variables.spender],
      });
    },
  });

  const approve = useCallback(
    async ({
      token,
      spender,
      amount,
    }: {
      token: EvmCurrency;
      spender: Address;
      amount: string;
    }) => {
      try {
        const result = await mutation.mutateAsync({
          token,
          spender,
          amount,
        });

        return result;
      } catch (error) {
        console.error("Error in approve function:", error);
        throw error;
      }
    },
    [mutation],
  );

  return {
    approve,
    useTokenAllowance,
    useIsTokenApproved,
  };
};
