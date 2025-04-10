import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components";
import { FlameIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import { ConnectWalletContent } from "components/connect-wallet";
import { useAstriaChainData } from "config";
import {
  ConnectCosmosWalletButton,
  useCosmosWallet,
} from "features/cosmos-wallet";
import { ConnectEvmWalletButton, useAstriaWallet } from "features/evm-wallet";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

/**
 * Button with dropdown to connect to multiple wallets.
 */
export const ConnectWalletsButton = () => {
  const pathname = usePathname();
  const { cosmosAccountAddress } = useCosmosWallet();
  const { chain } = useAstriaChainData();
  const account = useAccount();
  const {
    connectWallet,
    disconnectWallet,
    nativeTokenBalance,
    isLoadingNativeTokenBalance,
    usdcToNativeQuote,
    quoteLoading,
  } = useAstriaWallet();

  const isConnected = account.address || cosmosAccountAddress;
  const isSingleConnectWallet = pathname !== "/";

  if (isSingleConnectWallet && !isConnected) {
    return (
      <Button size="sm" onClick={connectWallet}>
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
              ? isSingleConnectWallet
                ? shortenAddress(account.address as string)
                : "Connected"
              : "Connect Wallet"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="hidden flex-col w-min p-3 gap-1 mr-4 md:flex"
        side="bottom"
      >
        {isSingleConnectWallet ? (
          <ConnectWalletContent
            isConnected={!!account.address}
            isLoading={
              (isLoadingNativeTokenBalance && !nativeTokenBalance) ||
              quoteLoading
            }
            account={account}
            balance={nativeTokenBalance ?? undefined}
            fiat={usdcToNativeQuote}
            explorer={{
              url: `${chain.blockExplorerUrl}/address/${account.address}`,
            }}
            label={shortenAddress(account.address as string)}
            icon={<FlameIcon />}
            onConnectWallet={connectWallet}
            onDisconnectWallet={disconnectWallet}
            isCollapsible={false}
          />
        ) : (
          <>
            <ConnectEvmWalletButton />
            <ConnectCosmosWalletButton />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
