import Big from "big.js";
import { useAstriaChainData } from "config";
import { useCallback } from "react";
import { type Address, formatUnits } from "viem";
import { useAccount, useConfig, usePublicClient } from "wagmi";

import { type EvmCurrency } from "@repo/flame-types";
import { createERC20Service } from "features/evm-wallet";

// TODO: Optimize, add caching.
export const useApproveToken = () => {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const config = useConfig();
  const { chain } = useAstriaChainData();

  const getAllowance = useCallback(
    async ({
      token,
      spender,
    }: {
      token: EvmCurrency;
      spender: Address;
    }): Promise<bigint | null> => {
      if (!address || !chainId || !publicClient) {
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
    [address, chain.contracts, chainId, config, publicClient],
  );

  const getIsApproved = useCallback(
    async ({
      token,
      spender,
      amount,
    }: {
      token: EvmCurrency;
      spender: Address;
      amount: string;
    }): Promise<boolean> => {
      // TODO: Check if native tokens need approval.
      if (token.isNative) {
        return true;
      }

      const allowance = await getAllowance({ token, spender });

      if (!allowance) {
        return false;
      }

      const formattedAllowance = formatUnits(allowance, token.coinDecimals);

      return new Big(formattedAllowance).gte(amount);
    },
    [getAllowance],
  );

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
      if (!address || !chainId || !publicClient) {
        return;
      }

      try {
        const tokenAddress = token.isNative
          ? chain.contracts.wrappedNativeToken.address
          : (token.erc20ContractAddress as Address);

        const erc20Service = createERC20Service(config, tokenAddress);

        const allowance = await erc20Service.approve(chainId, spender, amount);

        return allowance;
      } catch (error) {
        console.error("Error approving token:", error);
      }
    },
    [address, chain.contracts, chainId, config, publicClient],
  );

  return { getIsApproved, getAllowance, approve };
};
