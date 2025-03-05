import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/shadcn-primitives";
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
export default function ConnectWalletsButton() {
  const pathname = usePathname();
  const { cosmosAccountAddress } = useCosmosWallet();
  const userAccount = useAccount();

  const isConnected = userAccount.address || cosmosAccountAddress;

  return (
    <div>
      {pathname === "/" ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              className="rounded-xl bg-button-gradient text-white transition border border-transparent hover:border-white w-[156px] text-base"
            >
              <span>{isConnected ? "Connected" : "Connect"}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="flex flex-col w-30 mr-12 text-white gap-3 p-5 bg-radial-dark"
            side="bottom"
          >
            <div className="hover:text-orange-soft transition">
              <ConnectEvmWalletButton labelBeforeConnected="Connect to Flame wallet" />
            </div>
            <hr className="border-border" />
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
}
