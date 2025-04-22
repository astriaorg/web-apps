import { useMemo } from "react";
import { useAccount } from "wagmi";

import { AstriaIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import { ConnectMultipleWallets } from "components/connect-wallet";
import { useAstriaChainData } from "config";
import { useEvmWallet } from "../../hooks/use-evm-wallet";
import { useTokenBalance } from "../../hooks/use-token-balance";

interface ConnectEvmWalletButtonProps {
  onDisconnectWallet?: () => void;
}

/**
 * Button with information dropdown to connect to an EVM wallet.
 */
export const ConnectEvmWalletButton = ({
  onDisconnectWallet,
}: ConnectEvmWalletButtonProps) => {
  // FIXME - this won't work to show Base connection.
  //  too tired to wrap my head around this rn. come back to this
  const { chain, nativeToken } = useAstriaChainData();
  const {
    connectEvmWallet,
    disconnectEvmWallet,
    usdcToNativeQuote,
    quoteLoading,
  } = useEvmWallet();
  const userAccount = useAccount();

  const { balance: tokenBalance, isLoading: isLoadingTokenBalance } =
    useTokenBalance(userAccount.address, chain, nativeToken);

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
      isLoading={(isLoadingTokenBalance && !tokenBalance) || quoteLoading}
      account={userAccount}
      balance={tokenBalance ?? undefined}
      fiat={usdcToNativeQuote}
      explorer={{
        url: `${chain.blockExplorerUrl}/address/${userAccount.address}`,
      }}
      label={label}
      icon={<AstriaIcon />}
      onConnectWallet={() => connectEvmWallet()}
      onDisconnectWallet={() => {
        disconnectEvmWallet();
        onDisconnectWallet?.();
      }}
    />
  );
};
