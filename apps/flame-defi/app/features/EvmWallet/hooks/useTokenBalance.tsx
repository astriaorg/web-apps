import { EvmCurrency, EvmChainInfo } from "@repo/flame-types";
import { createWithdrawerService } from "features/EvmWallet";
import type { AstriaErc20WithdrawerService } from "features/EvmWallet/services/AstriaWithdrawerService/AstriaWithdrawerService";
import { useBalancePolling } from "features/GetBalancePolling";
import { useCallback, useMemo } from "react";
import { formatBalance } from "@repo/ui/utils";
import { formatUnits } from "viem";
import { useAccount, useBalance, useConfig } from "wagmi";

export const useTokenBalance = (
  selectedToken: EvmCurrency | null | undefined,
  evmChain: EvmChainInfo | undefined,
) => {
  const wagmiConfig = useConfig();
  const userAccount = useAccount();

  const {
    // status: nativeBalanceStatus,
    data: nativeBalance,
    // TODO: add in loading components for these states
    // isLoading: isLoadingEvmNativeTokenBalance,
  } = useBalance({
    address: userAccount.address,
  });

  const getBalanceCallback = useCallback(async () => {
    if (!wagmiConfig || !evmChain || !selectedToken || !userAccount.address) {
      return null;
    }

    if (selectedToken.erc20ContractAddress) {
      const withdrawerSvc = createWithdrawerService(
        wagmiConfig,
        selectedToken.erc20ContractAddress,
        true,
      ) as AstriaErc20WithdrawerService;

      const balanceRes = await withdrawerSvc.getBalance(
        evmChain.chainId,
        userAccount.address,
      );

      const balanceStr = formatBalance(
        balanceRes.toString(),
        selectedToken.coinDecimals,
      );
      return {
        value: balanceStr.toString() || "0",
        symbol: selectedToken.coinDenom,
      };
    } else if (
      selectedToken.nativeTokenWithdrawerContractAddress &&
      nativeBalance?.value
    ) {
      const formattedBalance = formatUnits(
        nativeBalance.value,
        nativeBalance.decimals,
      );

      return {
        value: formattedBalance || "0",
        symbol: selectedToken.coinDenom,
      };
    }
  }, [wagmiConfig, evmChain, selectedToken, userAccount, nativeBalance]);

  const pollingConfig = useMemo(
    () => ({
      enabled: !!evmChain && !!selectedToken,
      intervalMS: 10_000,
      onError: (error: Error) => {
        console.error("Failed to get balance:", error);
      },
    }),
    [evmChain, selectedToken],
  );

  const {
    balance: selectedEvmCurrencyBalance,
    isLoading: isLoadingSelectedEvmCurrencyBalance,
  } = useBalancePolling(getBalanceCallback, pollingConfig);

  return {
    balance: selectedEvmCurrencyBalance,
    isLoading: isLoadingSelectedEvmCurrencyBalance,
  };
};
