import React, { useMemo } from "react";
import { ConnectCosmosWalletButton } from "features/CosmosWallet";
import { ConnectEvmWalletButton, SingleWalletButton } from "features/EvmWallet";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/shadcn-primitives";
import { usePathname } from "next/navigation";

interface ConnectWalletsButtonProps {
  // Label to show before the user is connected to any wallets.
  labelBeforeConnected?: string;
}

/**
 * Button with dropdown to connect to multiple wallets.
 */
export default function ConnectWalletsButton({
  labelBeforeConnected,
}: ConnectWalletsButtonProps) {
  const pathname = usePathname();

  const label = useMemo(() => {
    return labelBeforeConnected ?? "Connect";
  }, [labelBeforeConnected]);

  return (
    <div>
      {pathname === "/" ? (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              className="rounded-md bg-button-gradient text-white transition border border-button-gradient hover:border-white w-[156px] text-base"
            >
              <span>{label}</span>
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
        <SingleWalletButton />
      )}
    </div>
  );
}
