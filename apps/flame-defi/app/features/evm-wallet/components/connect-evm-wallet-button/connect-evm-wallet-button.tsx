import { useMemo } from "react";
import { useAccount } from "wagmi";

import { AstriaIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import { ConnectMultipleWallets } from "components/connect-wallet";
import { useAstriaChainData } from "config";
import { useAstriaWallet } from "features/evm-wallet/hooks/use-astria-wallet";

interface ConnectEvmWalletButtonProps {
  onDisconnectWallet?: () => void;
}

/**
 * Button with information dropdown to connect to an EVM wallet.
 * Uses AstriaWallet under the hood.
 */
export const ConnectEvmWalletButton = ({
  onDisconnectWallet,
}: ConnectEvmWalletButtonProps) => {
  const userAccount = useAccount();
  const {
    connectWallet,
    disconnectWallet,
    nativeTokenBalance,
    isLoadingNativeTokenBalance,
    usdcToNativeQuote,
    quoteLoading,
  } = useAstriaWallet();

  const { chain } = useAstriaChainData();

  // ui
  const label = useMemo(() => {
    if (userAccount?.address) {
      return shortenAddress(userAccount.address);
    }
    return "EVM Wallet";
  }, [userAccount?.address]);

  // TODO - show correct icon based on connected chain, could be Base
  return (
    <ConnectMultipleWallets
      isConnected={!!userAccount.address}
      isLoading={
        (isLoadingNativeTokenBalance && !nativeTokenBalance) || quoteLoading
      }
      account={userAccount}
      balance={nativeTokenBalance ?? undefined}
      fiat={usdcToNativeQuote}
      explorer={{
        url: `${chain.blockExplorerUrl}/address/${userAccount.address}`,
      }}
      label={label}
      icon={<AstriaIcon />}
      onConnectWallet={connectWallet}
      onDisconnectWallet={() => {
        disconnectWallet();
        onDisconnectWallet?.();
      }}
    />
  );
};
