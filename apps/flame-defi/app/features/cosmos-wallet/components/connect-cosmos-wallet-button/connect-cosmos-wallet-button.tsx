import { useCallback, useMemo, useState } from "react";

import { CosmosIcon } from "@repo/ui/icons";
import { shortenAddress } from "@repo/ui/utils";
import { ConnectMultipleWallets } from "components/connect-wallet";
import { useConfig } from "config";
import { useCosmosWallet } from "features/cosmos-wallet/hooks/use-cosmos-wallet";
import { useCurrencyBalance } from "hooks/use-currency-balance";

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
    disconnectCosmosWallet,
    selectedCosmosChain,
  } = useCosmosWallet();
  const { cosmosChains } = useConfig();

  // use first cosmos chain if none selected yet
  const chain = selectedCosmosChain ?? Object.values(cosmosChains)[0];

  // get balance of native currency
  const { balance: cosmosBalance, isLoading: isLoadingCosmosBalance } =
    useCurrencyBalance(chain?.currencies.find((c) => c.isNative));

  // TODO - usd value
  const { quoteLoading, usdcToNativeQuote } = {
    quoteLoading: false,
    usdcToNativeQuote: {
      value: "---",
      symbol: "USDC",
    },
  };

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
      isConnected={Boolean(cosmosAccountAddress)}
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
