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

  const isConnected = account.address || cosmosAccountAddress;
  const isSingleConnectWallet = pathname !== "/";

  if (isSingleConnectWallet && !isConnected) {
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
              ? isSingleConnectWallet
                ? shortenAddress(account.address as string)
                : "Connected"
              : "Connect Wallet"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="hidden flex-col w-min p-3 gap-1 mr-4 lg:flex"
        side="bottom"
      >
        {isSingleConnectWallet ? (
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
            icon={<FlameIcon />}
            onConnectWallet={connectEvmWallet}
            onDisconnectWallet={disconnectEvmWallet}
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
