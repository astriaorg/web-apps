import { useMutation, useQueryClient } from "@tanstack/react-query";
import Big from "big.js";
import { useCallback } from "react";
import { type Address, formatUnits } from "viem";
import { useAccount, useConfig, usePublicClient } from "wagmi";

import { type EvmCurrency } from "@repo/flame-types";
import { useAstriaChainData } from "config";
import { QUERY_KEYS } from "constants/query-keys";
import { createErc20Service } from "features/evm-wallet";

// TODO: Unify token approval hooks.
export const useApproveToken = () => {
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();
  const config = useConfig();
  const { address, chainId } = useAccount();
  const { chain } = useAstriaChainData();

  const mutation = useMutation({
    mutationFn: async ({
      token,
      spender,
      amount,
    }: {
      token: EvmCurrency;
      spender: Address;
      amount: bigint;
    }) => {
      if (!address || !chainId) {
        throw new Error("Wallet is not connected.");
      }

      // Native tokens do not need approval.
      if (token.isNative) {
        return null;
      }

      const tokenAddress = token.isNative
        ? chain.contracts.wrappedNativeToken.address
        : (token.erc20ContractAddress as Address);

      const erc20Service = createErc20Service(config, tokenAddress);

      const hash = await erc20Service.approve(chainId, spender, amount);

      return hash;
    },
    onSuccess: async (hash, variables) => {
      // Invalidate relevant queries after successful approval.
      if (hash) {
        if (publicClient) {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
          });
          if (receipt.status === "success") {
            // Add a small delay to ensure blockchain state is updated.
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        void queryClient.invalidateQueries({
          queryKey: [
            QUERY_KEYS.USE_TOKEN_ALLOWANCE,
            variables.token,
            variables.spender,
          ],
        });
      }
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
      amount: bigint;
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

  const getIsApproved = useCallback(
    ({
      allowance,
      amount,
      token,
    }: {
      token: EvmCurrency;
      allowance: bigint | null;
      amount: string;
    }): boolean => {
      // Native tokens do not need approval.
      if (token.isNative) {
        return true;
      }

      if (!allowance) {
        return false;
      }

      const formattedAllowance = formatUnits(allowance, token.coinDecimals);

      return new Big(formattedAllowance).gte(amount);
    },
    [],
  );

  return {
    approve,
    getIsApproved,
  };
};
