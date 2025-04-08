import { ConnectWalletButton } from "@repo/ui/components";
import { CosmosIcon } from "@repo/ui/icons";
import { shortenAddress } from "@repo/ui/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCosmosWallet } from "../../hooks/use-cosmos-wallet";

interface ConnectCosmosWalletButtonProps {
  // Label to show before the user is connected to a wallet.
  labelBeforeConnected?: string;
}

/**
 * Button with information dropdown to connect to a Cosmos wallet.
 */
export default function ConnectCosmosWalletButton({
  labelBeforeConnected,
}: ConnectCosmosWalletButtonProps) {
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = useCallback(() => {
    setIsDropdownActive(!isDropdownActive);
  }, [isDropdownActive]);

  // handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ui
  const label = useMemo(() => {
    if (cosmosAccountAddress) {
      return shortenAddress(cosmosAccountAddress);
    }
    return labelBeforeConnected ?? "Connect";
  }, [labelBeforeConnected, cosmosAccountAddress]);

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
    <ConnectWalletButton
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
      onDisconnectWallet={disconnectCosmosWallet}
    />
  );
}
