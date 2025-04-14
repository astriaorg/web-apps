import { AstriaIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import { ConnectMultipleWallets } from "components/connect-wallet";
import { useAstriaChainData } from "config";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useAstriaWallet } from "../../hooks/use-astria-wallet";

interface ConnectEvmWalletButtonProps {
  onDisconnectWallet?: () => void;
}

/**
 * Button with information dropdown to connect to an EVM wallet.
 */
export const ConnectEvmWalletButton = ({
  onDisconnectWallet,
}: ConnectEvmWalletButtonProps) => {
  const { chain } = useAstriaChainData();
  const {
    connectWallet,
    disconnectWallet,
    nativeTokenBalance,
    isLoadingNativeTokenBalance,
    usdcToNativeQuote,
    quoteLoading,
  } = useAstriaWallet();
  const userAccount = useAccount();

  // const [showTransactions, setShowTransactions] = useState(false);

  // ui
  const label = useMemo(() => {
    if (userAccount?.address) {
      return shortenAddress(userAccount.address);
    }
    return "Flame Wallet";
  }, [userAccount?.address]);

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
