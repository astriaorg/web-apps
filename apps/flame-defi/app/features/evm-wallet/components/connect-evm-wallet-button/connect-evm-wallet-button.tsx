import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useAccount } from "wagmi";

import { Balance, TRADE_TYPE } from "@repo/flame-types";
import { AstriaIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import { ConnectMultipleWallets } from "components/connect-wallet";
import { useAstriaChainData } from "config";

import { useEvmCurrencyBalance } from "../../hooks/use-evm-currency-balance";
import { useEvmWallet } from "../../hooks/use-evm-wallet";
import { useGetQuote } from "../../hooks/use-get-quote";

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
  const { formatNumber } = useIntl();
  const { connectEvmWallet, disconnectEvmWallet } = useEvmWallet();

  const [fiatValue, setFiatValue] = useState<Balance>({
    value: "0",
    symbol: "usdc",
  });

  // FIXME - how to get the nativeToken from information from wagmi?
  //  like if they're connected to Base.
  //  wait, how do i connect them to Base?
  const { chain, nativeToken } = useAstriaChainData();

  const { balance: tokenBalance, isLoading: isLoadingTokenBalance } =
    useEvmCurrencyBalance(nativeToken);

  // Use the quote hook
  const { quote, loading: quoteLoading, getQuote } = useGetQuote();

  // Get USDC token
  // TODO - how will we get USDC quote for base chain?
  const usdcToken = useMemo(() => {
    return chain.currencies.find(
      (currency) => currency.coinDenom.toLowerCase() === "usdc",
    );
  }, [chain.currencies]);

  // Fetch quote when token balance changes
  useEffect(() => {
    if (!tokenBalance || !nativeToken || !usdcToken) {
      return;
    }

    void getQuote(
      TRADE_TYPE.EXACT_IN,
      { token: nativeToken, value: tokenBalance.value },
      { token: usdcToken, value: "" },
    );
  }, [tokenBalance, nativeToken, usdcToken, getQuote]);

  // Update fiat value when quote changes
  useEffect(() => {
    if (!quote) {
      return;
    }

    setFiatValue({
      value: formatNumber(parseFloat(quote.quoteDecimals), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      symbol: "usdc",
    });
  }, [quote, formatNumber]);

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
