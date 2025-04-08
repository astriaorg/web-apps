import { ConnectMultipleWallets } from "@repo/ui/components";
import { FlameIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import { useEvmChainData } from "config";
import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useEvmWallet } from "../../hooks/use-evm-wallet";

interface ConnectEvmWalletButtonProps {
  onDisconnectWallet?: () => void;
}

/**
 * Button with information dropdown to connect to an EVM wallet.
 */
export default function ConnectEvmWalletButton({
  onDisconnectWallet,
}: ConnectEvmWalletButtonProps) {
  const { selectedChain } = useEvmChainData();
  const {
    connectEvmWallet,
    disconnectEvmWallet,
    evmNativeTokenBalance,
    isLoadingEvmNativeTokenBalance,
    usdcToNativeQuote,
    quoteLoading,
  } = useEvmWallet();
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
        (isLoadingEvmNativeTokenBalance && !evmNativeTokenBalance) ||
        quoteLoading
      }
      account={userAccount}
      balance={evmNativeTokenBalance ?? undefined}
      fiat={usdcToNativeQuote}
      explorer={{
        url: `${selectedChain.blockExplorerUrl}/address/${userAccount.address}`,
      }}
      label={label}
      icon={<FlameIcon />}
      onConnectWallet={connectEvmWallet}
      onDisconnectWallet={() => {
        disconnectEvmWallet();
        onDisconnectWallet?.();
      }}
    />
  );
}
