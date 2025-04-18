import type { EvmCurrency } from "@repo/flame-types";
import { isZeroAddress } from "@repo/ui/utils";
import { useQuery } from "@tanstack/react-query";
import { useEvmChainData } from "config";
import {
  createPoolFactoryService,
  createPoolService,
  type Slot0Data,
} from "features/evm-wallet";
import type { FeeTier } from "pool/constants";
import { calculatePoolExchangeRate } from "pool/utils";
import type { Address } from "viem";
import { useConfig } from "wagmi";

export const useGetPool = ({
  token0,
  token1,
  selectedFeeTier,
  onError,
  onSuccess,
}: {
  token0?: EvmCurrency;
  token1?: EvmCurrency;
  selectedFeeTier: FeeTier;
  onError?: () => void;
  onSuccess?: (params: {
    address: string;
    slot0: Slot0Data;
    rateToken0ToToken1: string;
    rateToken1ToToken0: string;
  }) => void;
}) => {
  const config = useConfig();
  const { selectedChain } = useEvmChainData();

  return useQuery({
    // TODO: For better caching, don't care what order the tokens are passed in.
    queryKey: ["useGetPool", token0, token1, selectedFeeTier, selectedChain],
    queryFn: async () => {
      if (!token0 || !token1) {
        return null;
      }

      const poolFactoryService = createPoolFactoryService(
        config,
        selectedChain.contracts.poolFactory.address,
      );

      // Handle native tokens. If one of the tokens is native, we need to get the wrapped token address.
      const token0Address = token0.isNative
        ? selectedChain.contracts.wrappedNativeToken.address
        : (token0.erc20ContractAddress as Address);
      const token1Address = token1.isNative
        ? selectedChain.contracts.wrappedNativeToken.address
        : (token1.erc20ContractAddress as Address);
      const address = await poolFactoryService.getPool(
        selectedChain.chainId,
        token0Address,
        token1Address,
        selectedFeeTier,
      );

      if (!address || isZeroAddress(address)) {
        onError?.();
        return null;
      }

      const poolService = createPoolService(config, address);

      const slot0 = await poolService.getSlot0(selectedChain.chainId);

      const { rateToken0ToToken1, rateToken1ToToken0 } =
        calculatePoolExchangeRate({
          decimal0: token0.coinDecimals,
          decimal1: token1.coinDecimals,
          sqrtPriceX96: slot0.sqrtPriceX96,
        });

      onSuccess?.({ address, slot0, rateToken0ToToken1, rateToken1ToToken0 });

      return { address, slot0, rateToken0ToToken1, rateToken1ToToken0 };
    },
  });
};
