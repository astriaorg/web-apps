import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { FlameNetwork } from "@repo/flame-types";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components";
import { CheckIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";
import { LINKS } from "components/footer/links";
import { useConfig } from "config";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MobileNavigationMenuLink } from "./mobile-navigation-menu-link";
import { MobileWalletConnect } from "./mobile-wallet-connect";
import { NavigationMenuButton } from "./navigation-menu-button";
import { NetworkIcon } from "./network-icon";

export const MobileNavigationMenu = () => {
  const pathname = usePathname();
  const {
    featureFlags,
    networksList,
    selectedFlameNetwork,
    selectFlameNetwork,
  } = useConfig();

  const [isOpen, setIsOpen] = useState(false);
  const [isNetworkSelectOpen, setIsNetworkSelectOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleNetworkSelect = useCallback(
    (network: FlameNetwork) => {
      selectFlameNetwork(network);
      setIsNetworkSelectOpen(false);
    },
    [selectFlameNetwork],
  );

  const handleOnNetworkSelectOpen = useCallback(() => {
    setIsNetworkSelectOpen(true);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="flex items-center gap-4 lg:hidden">
      <MobileWalletConnect handleClose={handleClose} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="p-0 hover:text-initial">
            <NavigationMenuButton size={20} isOpen={isOpen} />
          </Button>
        </DialogTrigger>
        {/* Use primitive Dialog.Content so we can customize overlay and close button. */}
        <DialogPortal>
          <DialogOverlay className="bg-background-default" />
          <DialogPrimitive.Content
            className={cn(
              "fixed z-50 top-0 left-0 w-screen h-screen bg-background-default duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              // Fix layout shift when page has scrollbar. This is due to the `react-remove-scroll` library that Radix UI uses under the hood.
              "w-[calc(100vw-var(--removed-body-scroll-bar-size,0px))]",
            )}
          >
            <DialogTitle className="sr-only">Flame Apps</DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
            <div className="flex flex-col px-6 py-8 h-full">
              <div className="flex-1" />
              <div className="flex flex-col items-center space-y-8">
                <MobileNavigationMenuLink
                  href={LINKS.BRIDGE}
                  isActive={pathname.startsWith(LINKS.BRIDGE)}
                >
                  Bridge
                </MobileNavigationMenuLink>
                <MobileNavigationMenuLink
                  href={LINKS.SWAP}
                  isActive={pathname.startsWith(LINKS.SWAP)}
                >
                  Swap
                </MobileNavigationMenuLink>
                {featureFlags.poolEnabled && (
                  <MobileNavigationMenuLink
                    href={LINKS.POOL}
                    isActive={pathname.startsWith(LINKS.POOL)}
                  >
                    Pool
                  </MobileNavigationMenuLink>
                )}
                {featureFlags.earnEnabled && (
                  <>
                    <MobileNavigationMenuLink
                      href={LINKS.EARN}
                      isActive={pathname.startsWith(LINKS.EARN)}
                    >
                      Earn
                    </MobileNavigationMenuLink>
                    <MobileNavigationMenuLink
                      href={LINKS.BORROW}
                      isActive={pathname.startsWith(LINKS.BORROW)}
                    >
                      Borrow
                    </MobileNavigationMenuLink>
                  </>
                )}
              </div>
              <div className="flex-1" />
              <Button
                variant="secondary"
                onClick={() => handleOnNetworkSelectOpen()}
              >
                Mainnet
              </Button>
            </div>

            {/* Align with the button in the navigation menu for seamless transitions. */}
            <DialogClose className="absolute right-4 top-4.5">
              <NavigationMenuButton size={20} isOpen={isOpen} />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>

      <Dialog open={isNetworkSelectOpen} onOpenChange={setIsNetworkSelectOpen}>
        <DialogContent className="w-full max-w-full top-auto bottom-0 translate-y-0 rounded-t-xl border-stroke-light border-b-transparent">
          <DialogHeader>
            <DialogTitle>Network</DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
            <div className="flex flex-col mt-6">
              {networksList.map((network) => (
                <div
                  key={network}
                  className="flex select-none items-center gap-2 rounded-md px-6 py-3 hover:bg-surface-3"
                  onClick={() => handleNetworkSelect(network)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <NetworkIcon network={network} size={16} />
                    <span className="capitalize">{network}</span>
                  </div>
                  {network === selectedFlameNetwork && (
                    <div>
                      <CheckIcon className="h-3 w-3 text-icon-subdued" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
