import { useMemo } from "react";
import { useAccount } from "wagmi";

import { Balance } from "@repo/flame-types";
import { AstriaIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import { ConnectMultipleWallets } from "components/connect-wallet";
import { useAstriaChainData } from "config";
import { useEvmCurrencyBalance } from "features/evm-wallet/hooks/use-evm-currency-balance";
import { useEvmWallet } from "features/evm-wallet/hooks/use-evm-wallet";
import { useUsdQuote } from "features/evm-wallet/hooks/use-usd-quote";

interface ConnectEvmWalletButtonProps {
  onDisconnectWallet?: () => void;
}

/**
 * Button with information dropdown to connect to an EVM wallet.
 */
export const ConnectEvmWalletButton = ({
  onDisconnectWallet,
}: ConnectEvmWalletButtonProps) => {
  const userAccount = useAccount();
  const { connectEvmWallet, disconnectEvmWallet } = useEvmWallet();

  // FIXME - how to get the nativeToken from information from wagmi?
  //  like if they're connected to Base.
  const { chain, nativeToken } = useAstriaChainData();

  const { balance: tokenBalance, isLoading: isLoadingTokenBalance } =
    useEvmCurrencyBalance(nativeToken);

  const quoteInput = useMemo(
    () => ({
      token: nativeToken,
      value: tokenBalance?.value || "0",
    }),
    [nativeToken, tokenBalance?.value],
  );

  const { quote, isLoading: quoteLoading } = useUsdQuote(quoteInput);

  const fiatValue = useMemo<Balance | undefined>(() => {
    if (!quote) {
      return;
    }

    return {
      value: quote.quoteDecimals,
      symbol: "usdc",
    };
  }, [quote]);

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
      fiat={fiatValue}
      explorer={{
        url: `${chain.blockExplorerUrl}/address/${userAccount.address}`,
      }}
      label={label}
      icon={<AstriaIcon />}
      onConnectWallet={connectEvmWallet}
      onDisconnectWallet={() => {
        disconnectEvmWallet();
        onDisconnectWallet?.();
      }}
    />
  );
};
