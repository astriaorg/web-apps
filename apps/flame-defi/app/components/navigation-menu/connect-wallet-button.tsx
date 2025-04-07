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
export const ConnectWalletButton = () => {
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
            className="flex flex-col mr-4 gap-3 p-6 bg-surface-1"
            side="bottom"
          >
            <div className="hover:text-orange-soft transition">
              <ConnectEvmWalletButton labelBeforeConnected="Connect to Flame wallet" />
            </div>
            <div className="hover:text-orange-soft transition">
              <ConnectCosmosWalletButton labelBeforeConnected="Connect to Cosmos wallet" />
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <SingleWalletConnect />
      )}
    </div>
  );
};
