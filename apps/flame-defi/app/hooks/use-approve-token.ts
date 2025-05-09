import { useMutation, useQueryClient } from "@tanstack/react-query";
import Big from "big.js";
import { useAstriaChainData } from "config";
import { useCallback } from "react";
import { type Address, formatUnits } from "viem";
import { useAccount, useConfig } from "wagmi";

import { type EvmCurrency } from "@repo/flame-types";
import { createErc20Service } from "features/evm-wallet";

// TODO: Unify token approval hooks.
export const useApproveToken = () => {
  const queryClient = useQueryClient();
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
    onSuccess: (hash, variables) => {
      console.log("onSuccess", hash);
      // Invalidate relevant queries after successful approval.
      if (!hash) {
        return;
      }

      void queryClient.invalidateQueries({
        // TODO: Share allowance query key.
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
