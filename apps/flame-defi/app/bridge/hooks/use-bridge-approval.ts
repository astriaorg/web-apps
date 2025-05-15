import { useMutation, useQuery } from "@tanstack/react-query";
import Big from "big.js";
import { useMemo } from "react";
import { Address, formatUnits, maxUint256, parseUnits } from "viem";
import { useConfig as useWagmiConfig } from "wagmi";

import { ChainType, EvmCurrency } from "@repo/flame-types";
import { ChainConnection } from "bridge/types";
import { Environment, useConfig } from "config";
import { createErc20Service } from "features/evm-wallet";

type UseApprovalProps = {
  chainConnection: ChainConnection;
  amountInput?: string;
};

// NOTE - existing useTokenApproval didn't quite work and didn't have time to refactor and combine atm
export const useBridgeApproval = ({
  chainConnection,
  amountInput = "0",
}: UseApprovalProps) => {
  const wagmiConfig = useWagmiConfig();
  const { environment } = useConfig();

  const address = chainConnection?.address ?? null;
  const chain = chainConnection?.chain ?? null;
  const currency = chainConnection?.currency ?? null;

  // only non-native evm currencies need approvals
  const isErc20 =
    currency && currency instanceof EvmCurrency && !currency.isNative;

  const erc20Address = isErc20 ? currency.erc20ContractAddress : null;
  const bridgeAddress = isErc20 ? currency.astriaIntentBridgeAddress : null;

  const shouldEnableQuery = Boolean(
    address &&
      chain &&
      isErc20 &&
      erc20Address &&
      bridgeAddress &&
      (chain.chainType === ChainType.EVM ||
        chain.chainType === ChainType.ASTRIA),
  );

  const allowanceQuery = useQuery({
    queryKey: [
      "allowanceQuery",
      address,
      chain?.chainId,
      erc20Address,
      bridgeAddress,
    ],
    queryFn: async () => {
      if (
        address &&
        (chain?.chainType === ChainType.EVM ||
          chain?.chainType === ChainType.ASTRIA) &&
        currency instanceof EvmCurrency &&
        currency.erc20ContractAddress &&
        currency.astriaIntentBridgeAddress
      ) {
        const erc20Service = createErc20Service(
          wagmiConfig,
          currency.erc20ContractAddress,
        );

        const allowance = await erc20Service.allowance(
          chain.chainId,
          address as Address,
          currency.astriaIntentBridgeAddress,
        );

        return formatUnits(allowance, currency.coinDecimals);
      }

      return false;
    },
    enabled: shouldEnableQuery,
    refetchInterval: false,
    placeholderData: false,
  });

  const approvalMutation = useMutation({
    mutationFn: async () => {
      if (
        !address ||
        !chain ||
        (chain.chainType !== ChainType.EVM &&
          chain.chainType !== ChainType.ASTRIA) ||
        !(currency instanceof EvmCurrency) ||
        !currency.erc20ContractAddress ||
        !currency.astriaIntentBridgeAddress
      ) {
        throw new Error("Cannot approve token: missing required data");
      }

      const erc20Service = createErc20Service(
        wagmiConfig,
        currency.erc20ContractAddress,
      );

      const approvalAmount =
        environment === Environment.DEVELOP
          ? parseUnits(amountInput, currency.coinDecimals)
          : maxUint256;
      return await erc20Service.approve(
        chain.chainId,
        currency.astriaIntentBridgeAddress,
        approvalAmount,
      );
    },
    onSuccess: () => {
      // invalidate the approval query to refresh the approval status
      void allowanceQuery.refetch();
    },
  });

  // function to handle token approval
  const approveToken = async () => {
    if (allowanceQuery.data) {
      return approvalMutation.mutateAsync();
    }
    return null;
  };

  const needsApproval = useMemo(() => {
    if (!allowanceQuery.data || !amountInput) {
      return false;
    }
    return new Big(amountInput).gt(allowanceQuery.data);
  }, [allowanceQuery.data, amountInput]);

  return {
    // data from the query
    needsApproval,
    isCheckingApproval: allowanceQuery.isLoading,
    isError: allowanceQuery.isError,
    error: allowanceQuery.error,

    // data from the mutation
    isApproving: approvalMutation.isPending,
    approvalError: approvalMutation.error,

    // the approval and refetch function
    approveToken,
    refetchNeedsApproval: allowanceQuery.refetch,
  };
};
