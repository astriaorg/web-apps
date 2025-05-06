import { useQuery } from "@tanstack/react-query";
import { useAstriaChainData } from "config";
import { type Address } from "viem";
import { useAccount, useConfig, usePublicClient } from "wagmi";

import { type EvmCurrency } from "@repo/flame-types";
import { createERC20Service } from "features/evm-wallet";

const STALE_TIME_MILLISECONDS = 1000 * 30; // 30 seconds.
const CACHE_TIME_MILLISECONDS = 1000 * 60 * 5; // 5 minutes.

export const useTokenAllowance = ({
  token,
  spender,
}: {
  token?: EvmCurrency;
  spender: Address;
}) => {
  const publicClient = usePublicClient();
  const config = useConfig();
  const { address, chainId } = useAccount();
  const { chain } = useAstriaChainData();

  return useQuery<bigint | null>({
    queryKey: ["useTokenAllowance", token, spender],
    queryFn: async () => {
      console.log("useTokenAllowance", token?.coinDenom);
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
        console.log("allowance", token?.coinDenom, allowance);
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
