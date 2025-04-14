import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components";
import { AstriaIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import { ConnectWalletContent } from "components/connect-wallet";
import { useAstriaChainData } from "config";
import {
  ConnectCosmosWalletButton,
  useCosmosWallet,
} from "features/cosmos-wallet";
import { ConnectEvmWalletButton, useAstriaWallet } from "features/evm-wallet";
import { usePathname } from "next/navigation";
import { useEvmChainData } from "config";
import { useEvmWallet } from "features/evm-wallet";
import { useAccount } from "wagmi";

/**
 * Button with dropdown to connect to multiple wallets.
 */
export const ConnectWalletsButton = () => {
  const { selectedChain } = useEvmChainData();
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

  const isConnected = !!account.address;

  if (!isConnected) {
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
          icon={<AstriaIcon />}
          onConnectWallet={connectWallet}
          onDisconnectWallet={disconnectWallet}
          isCollapsible={false}
        />
      </PopoverContent>
    </Popover>
  );
};
