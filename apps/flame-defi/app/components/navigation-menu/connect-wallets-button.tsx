import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components";
import { AstriaIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import { ConnectWalletContent } from "components/connect-wallet";
import { useEvmChainData } from "config";
import { useEvmWallet } from "features/evm-wallet";
import { useAccount } from "wagmi";

/**
 * Button with dropdown to connect to multiple wallets.
 */
export const ConnectWalletsButton = () => {
  const { selectedChain } = useEvmChainData();
  const account = useAccount();
  const {
    connectEvmWallet,
    disconnectEvmWallet,
    evmNativeTokenBalance,
    isLoadingEvmNativeTokenBalance,
    usdcToNativeQuote,
    quoteLoading,
  } = useEvmWallet();

  const isConnected = !!account.address;

  if (!isConnected) {
    return (
      <Button size="sm" onClick={connectEvmWallet}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm">
          <span>
            {isConnected
              ? shortenAddress(account.address as string)
              : "Connect Wallet"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="hidden flex-col w-min p-3 gap-1 mr-4 md:flex"
        side="bottom"
      >
        <ConnectWalletContent
          isConnected={!!account.address}
          isLoading={
            (isLoadingEvmNativeTokenBalance && !evmNativeTokenBalance) ||
            quoteLoading
          }
          account={account}
          balance={evmNativeTokenBalance ?? undefined}
          fiat={usdcToNativeQuote}
          explorer={{
            url: `${selectedChain.blockExplorerUrl}/address/${account.address}`,
          }}
          label={shortenAddress(account.address as string)}
          icon={<AstriaIcon />}
          onConnectWallet={connectEvmWallet}
          onDisconnectWallet={disconnectEvmWallet}
          isCollapsible={false}
        />
      </PopoverContent>
    </Popover>
  );
};
