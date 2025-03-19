import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";

import { FlameNetwork } from "@repo/flame-types";
import { CheckMarkIcon, FlameIcon } from "@repo/ui/icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@repo/ui/components";
import { shortenAddress } from "@repo/ui/utils";
import { useConfig } from "config";
import {
  ConnectCosmosWalletButton,
  useCosmosWallet,
} from "features/cosmos-wallet";
import {
  ConnectEvmWalletButton,
  SingleWalletContent,
  useEvmWallet,
} from "features/evm-wallet";

const MobileNetworkSelector = () => {
  const { selectedFlameNetwork, selectFlameNetwork, networksList } =
    useConfig();

  const handleNetworkSelect = useCallback(
    (network: FlameNetwork) => {
      selectFlameNetwork(network);
    },
    [selectFlameNetwork],
  );

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem
        value="transaction-details"
        className="text-grey-light text-sm border-b-0"
      >
        <div className="flex items-center justify-between w-full">
          <AccordionTrigger className="flex items-center gap-2">
            <FlameIcon />
            <span className="text-white text-base font-normal capitalize">
              {selectedFlameNetwork}
            </span>
          </AccordionTrigger>
        </div>
        <AccordionContent>
          {networksList.map((network) => (
            <div
              key={network}
              className="capitalize cursor-pointer mt-4"
              onClick={() => handleNetworkSelect(network)}
            >
              <div className="flex items-center justify-between text-white text-base">
                <div className="flex items-center gap-2">
                  <FlameIcon />
                  <span
                    className={`${selectedFlameNetwork === network ? "text-orange-soft" : "text-white"} text-base`}
                  >
                    {network}
                  </span>
                </div>
                {selectedFlameNetwork === network && (
                  <CheckMarkIcon className="text-orange-soft" />
                )}
              </div>
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default function MobileWalletConnect({
  handleClose,
}: {
  handleClose: () => void;
}) {
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
          <MobileNetworkSelector />
          <hr className="border-border w-full my-4" />
          {isBridgePage ? (
            <>
              <div className="hover:text-orange-soft transition w-full">
                <ConnectEvmWalletButton labelBeforeConnected="Connect to Flame wallet" />
              </div>
              <hr className="border-border w-full my-4" />
              <div className="hover:text-orange-soft transition w-full">
                <ConnectCosmosWalletButton labelBeforeConnected="Connect to Cosmos wallet" />
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
}
