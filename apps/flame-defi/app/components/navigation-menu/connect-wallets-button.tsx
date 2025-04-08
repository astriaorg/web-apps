import {
  Button,
  ConnectWalletContent,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components";
import { FlameIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import { useEvmChainData } from "config";
import {
  ConnectCosmosWalletButton,
  useCosmosWallet,
} from "features/cosmos-wallet";
import { ConnectEvmWalletButton, useEvmWallet } from "features/evm-wallet";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

/**
 * Button with dropdown to connect to multiple wallets.
 */
export const ConnectWalletsButton = () => {
  const pathname = usePathname();
  const { cosmosAccountAddress } = useCosmosWallet();
  const { address } = useAccount();
  const { selectedChain } = useEvmChainData();
  const userAccount = useAccount();
  const {
    connectEvmWallet,
    disconnectEvmWallet,
    evmNativeTokenBalance,
    isLoadingEvmNativeTokenBalance,
    usdcToNativeQuote,
    quoteLoading,
  } = useEvmWallet();

  const isConnected = address || cosmosAccountAddress;
  const isSingleWalletConnect = pathname !== "/";

  if (isSingleWalletConnect && !isConnected) {
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
              ? isSingleWalletConnect
                ? shortenAddress(address as string)
                : "Connected"
              : "Connect Wallet"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="hidden flex-col w-min p-3 gap-1 lg:flex"
        side="bottom"
      >
        {isSingleWalletConnect ? (
          <ConnectWalletContent
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
            label={shortenAddress(userAccount.address as string)}
            icon={<FlameIcon />}
            onDisconnectWallet={disconnectEvmWallet}
            // Force the accordion to stay opened.
            value="wallet"
          />
        ) : (
          <>
            <ConnectEvmWalletButton labelBeforeConnected="Flame Wallet" />
            <ConnectCosmosWalletButton labelBeforeConnected="Cosmos Wallet" />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
