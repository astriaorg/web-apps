import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components";
import {
  ConnectCosmosWalletButton,
  useCosmosWallet,
} from "features/cosmos-wallet";
import {
  ConnectEvmWalletButton,
  SingleWalletConnect,
} from "features/evm-wallet";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";

/**
 * Button with dropdown to connect to multiple wallets.
 */
export const ConnectWalletsButton = () => {
  const pathname = usePathname();
  const { cosmosAccountAddress } = useCosmosWallet();
  const userAccount = useAccount();

  const isConnected = userAccount.address || cosmosAccountAddress;

  return (
    <div>
      {pathname === "/" ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm">
              <span>{isConnected ? "Connected" : "Connect Wallet"}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="hidden flex-col w-min mr-4 p-3 gap-1 w-48 lg:flex"
            side="bottom"
          >
            <ConnectEvmWalletButton labelBeforeConnected="Flame Wallet" />
            <ConnectCosmosWalletButton labelBeforeConnected="Cosmos Wallet" />
          </PopoverContent>
        </Popover>
      ) : (
        <SingleWalletConnect />
      )}
    </div>
  );
};
