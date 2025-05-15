import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { useAccount, useConfig } from "wagmi";

import { type EvmCurrency } from "@repo/flame-types";
import { useAstriaChainData } from "config";
import { createErc20Service } from "features/evm-wallet";

const STALE_TIME_MILLISECONDS = 1000 * 30; // 30 seconds.
const CACHE_TIME_MILLISECONDS = 1000 * 60 * 5; // 5 minutes.

// TODO: Unify token approval hooks.
export const useTokenAllowance = ({
  token,
  spender,
}: {
  token?: EvmCurrency;
  spender: Address;
}) => {
  const config = useConfig();
  const { address, chainId } = useAccount();
  const { chain } = useAstriaChainData();

  return useQuery<bigint | null>({
    queryKey: ["useTokenAllowance", token, spender],
    queryFn: async () => {
      if (!address || !chainId || !token || !spender) {
        return null;
      }

      try {
        const tokenAddress = token.isNative
          ? chain.contracts.wrappedNativeToken.address
          : (token.erc20ContractAddress as Address);

        const erc20Service = createErc20Service(config, tokenAddress);

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
    enabled: !!address && !!chainId && !!token && !!spender,
    staleTime: STALE_TIME_MILLISECONDS,
    gcTime: CACHE_TIME_MILLISECONDS,
  });
};
