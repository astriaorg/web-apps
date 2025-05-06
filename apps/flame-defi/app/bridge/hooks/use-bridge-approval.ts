import { useMutation, useQuery } from "@tanstack/react-query";
import { useConfig } from "config";
import { Address } from "viem";
import { useConfig as useWagmiConfig } from "wagmi";

import { ChainType } from "@repo/flame-types";
import { ChainConnection } from "bridge/types";
import { createErc20Service } from "features/evm-wallet";

type UseApprovalProps = {
  chainConnection: ChainConnection;
};

// NOTE - existing useTokenApproval didn't quite work and didn't have time to refactor and combine atm
export const useBridgeApproval = ({ chainConnection }: UseApprovalProps) => {
  const wagmiConfig = useWagmiConfig();
  const { tokenApprovalAmount } = useConfig();

  const address = chainConnection?.address ?? null;
  const chain = chainConnection?.chain ?? null;
  const currency = chainConnection?.currency ?? null;

  // only non-native evm currencies need approvals
  const isErc20 = currency && currency.isEvmCurrency() && !currency.isNative;

  const erc20Address = isErc20 ? currency.erc20ContractAddress : null;
  const bridgeAddress = isErc20 ? currency.astriaIntentBridgeAddress : null;

  const shouldEnableQuery = !!(
    address &&
    chain &&
    isErc20 &&
    erc20Address &&
    bridgeAddress &&
    (chain.chainType === ChainType.EVM || chain.chainType === ChainType.ASTRIA)
  );

  console.log({
    shouldEnableQuery,
    address,
    chain,
    currency,
  });

  const approvalQuery = useQuery({
    queryKey: [
      "tokenApproval",
      address,
      chain?.chainId,
      erc20Address,
      bridgeAddress,
    ],
    queryFn: async () => {
      // EVM chain type
      if (
        address &&
        (chain?.chainType === ChainType.EVM ||
          chain?.chainType === ChainType.ASTRIA) &&
        currency?.isEvmCurrency() &&
        currency.erc20ContractAddress &&
        currency.astriaIntentBridgeAddress
      ) {
        const erc20Service = createErc20Service(
          wagmiConfig,
          currency.erc20ContractAddress,
        );

        const allowance = await erc20Service.getTokenAllowance(
          chain.chainId,
          address as Address,
          currency.astriaIntentBridgeAddress,
        );

        console.log({ allowance });

        return allowance === "0";
      }

      return false;
    },
    enabled: shouldEnableQuery,
    refetchInterval: 10000, // 10 seconds
    placeholderData: false,
  });

  const approvalMutation = useMutation({
    mutationFn: async () => {
      if (
        !address ||
        !chain ||
        (chain.chainType !== ChainType.EVM &&
          chain.chainType !== ChainType.ASTRIA) ||
        !currency?.isEvmCurrency() ||
        !currency.erc20ContractAddress ||
        !currency.astriaIntentBridgeAddress
      ) {
        throw new Error("Cannot approve token: missing required data");
      }

      const erc20Service = createErc20Service(
        wagmiConfig,
        currency.erc20ContractAddress,
      );

      return await erc20Service.approveToken(
        chain.chainId,
        currency.astriaIntentBridgeAddress,
        tokenApprovalAmount,
        // tokenApprovalAmount already has decimals taken into account,
        //  so pass in 0 here
        0,
      );
    },
    onSuccess: () => {
      // invalidate the approval query to refresh the approval status
      void approvalQuery.refetch();
    },
  });

  // function to handle token approval
  const approveToken = async () => {
    if (approvalQuery.data) {
      return approvalMutation.mutateAsync();
    }
    return null;
  };

  return {
    // data from the query
    needsApproval: approvalQuery.data,
    isCheckingApproval: approvalQuery.isLoading,
    isError: approvalQuery.isError,
    error: approvalQuery.error,

    // data from the mutation
    isApproving: approvalMutation.isPending,
    approvalError: approvalMutation.error,

    // the approval function
    approveToken,
  };
};
