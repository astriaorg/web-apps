import { CosmosIcon } from "@repo/ui/icons";
import { shortenAddress } from "@repo/ui/utils";
import { ConnectMultipleWallets } from "components/connect-wallet";
import { useCallback, useMemo, useState } from "react";
import { useCosmosWallet } from "../../hooks/use-cosmos-wallet";

interface ConnectCosmosWalletButtonProps {
  onDisconnectWallet?: () => void;
}

/**
 * Button with information dropdown to connect to a Cosmos wallet.
 */
export const ConnectCosmosWalletButton = ({
  onDisconnectWallet,
}: ConnectCosmosWalletButtonProps) => {
  const {
    connectCosmosWallet,
    cosmosAccountAddress,
    cosmosBalance,
    disconnectCosmosWallet,
    isLoadingCosmosBalance,
    usdcToNativeQuote,
    quoteLoading,
  } = useCosmosWallet();
  // information dropdown
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  // const [showTransactions, setShowTransactions] = useState(false);

  const toggleDropdown = useCallback(() => {
    setIsDropdownActive(!isDropdownActive);
  }, [isDropdownActive]);

  // ui
  const label = useMemo(() => {
    if (cosmosAccountAddress) {
      return shortenAddress(cosmosAccountAddress);
    }
    return "Cosmos Wallet";
  }, [cosmosAccountAddress]);

  // connect to wallet or show information dropdown
  const handleConnectWallet = useCallback(() => {
    if (!cosmosAccountAddress) {
      connectCosmosWallet();
    }
    if (cosmosAccountAddress) {
      // if user is already connected, open information dropdown
      toggleDropdown();
    }
  }, [connectCosmosWallet, toggleDropdown, cosmosAccountAddress]);

  return (
    <ConnectMultipleWallets
      isConnected={!!cosmosAccountAddress}
      isLoading={isLoadingCosmosBalance || !cosmosBalance || quoteLoading}
      account={
        cosmosAccountAddress ? { address: cosmosAccountAddress } : undefined
      }
      balance={cosmosBalance ?? undefined}
      fiat={usdcToNativeQuote}
      label={label}
      icon={<CosmosIcon />}
      onConnectWallet={handleConnectWallet}
      onDisconnectWallet={() => {
        disconnectCosmosWallet();
        onDisconnectWallet?.();
      }}
    />
  );
};
