import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";

import {
  Button,
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@repo/ui/components";
import { FlameIcon } from "@repo/ui/icons/polychrome";
import { shortenAddress } from "@repo/ui/utils";
import {
  ConnectCosmosWalletButton,
  useCosmosWallet,
} from "features/cosmos-wallet";
import {
  ConnectEvmWalletButton,
  SingleWalletContent,
  useEvmWallet,
} from "features/evm-wallet";
import { MobileNetworkSelect } from "./mobile-network-select";

export const MobileWalletConnect = ({
  handleClose,
}: {
  handleClose: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { connectEvmWallet } = useEvmWallet();
  const userAccount = useAccount();
  const { cosmosAccountAddress } = useCosmosWallet();
  const isBridgePage = pathname === "/";
  const isConnected = userAccount.address || cosmosAccountAddress;

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      handleClose();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <div>
          {isBridgePage && (
            <Button variant="gradient" className="w-[156px] text-base">
              {isConnected ? "Connected" : "Connect"}
            </Button>
          )}
          {!isBridgePage && (
            <div>
              {userAccount.address ? (
                <div className="flex items-center border border-border rounded-xl px-3 py-2 h-[36px] cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FlameIcon size={16} />
                    <span className="text-white text-base font-normal">
                      {userAccount.address &&
                        shortenAddress(userAccount.address)}
                    </span>
                  </div>
                </div>
              ) : (
                <Button
                  variant="gradient"
                  className="w-[156px] text-base"
                  onClick={() => connectEvmWallet()}
                >
                  Connect
                </Button>
              )}
            </div>
          )}
        </div>
      </DrawerTrigger>
      <DrawerContent className="bg-radial-dark pb-12">
        <div className="pt-4 pb-0 px-8 flex flex-col items-start">
          <MobileNetworkSelect />
          <hr className="border-border w-full my-4" />
          {isBridgePage ? (
            <>
              <div className="hover:text-orange-soft transition w-full">
                <ConnectEvmWalletButton />
              </div>
              <hr className="border-border w-full my-4" />
              <div className="hover:text-orange-soft transition w-full">
                <ConnectCosmosWalletButton />
              </div>
            </>
          ) : userAccount.address ? (
            <div className="flex w-full flex-col gap-3 pt-5">
              <SingleWalletContent
                address={userAccount.address}
                handleClose={() => onOpenChange(false)}
              />
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
