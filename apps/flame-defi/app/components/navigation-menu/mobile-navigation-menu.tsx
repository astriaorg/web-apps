import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Button,
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components";
import { cn } from "@repo/ui/utils";
import { useConfig } from "config";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MobileNavigationMenuLink } from "./mobile-navigation-menu-link";
import { MobileWalletConnect } from "./mobile-wallet-connect";
import { NavigationMenuButton } from "./navigation-menu-button";

export const MobileNavigationMenu = () => {
  const pathname = usePathname();
  const { featureFlags } = useConfig();

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
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
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              <MobileNavigationMenuLink href="/" isActive={pathname.startsWith("/")}>
                Bridge
              </MobileNavigationMenuLink>
              <MobileNavigationMenuLink
                href="/swap"
                isActive={pathname.startsWith("/swap")}
              >
                Swap
              </MobileNavigationMenuLink>
              {featureFlags.poolEnabled && (
                <MobileNavigationMenuLink
                  href="/pool"
                  isActive={pathname.startsWith("/pool")}
                >
                  Pool
                </MobileNavigationMenuLink>
              )}
              {featureFlags.earnEnabled && (
                <>
                  <MobileNavigationMenuLink
                    href="/earn"
                    isActive={pathname.startsWith("/earn")}
                  >
                    Earn
                  </MobileNavigationMenuLink>
                  <MobileNavigationMenuLink
                    href="/borrow"
                    isActive={pathname.startsWith("/borrow")}
                  >
                    Borrow
                  </MobileNavigationMenuLink>
                </>
              )}
            </div>

            {/* Align with the button in the navigation menu for seamless transitions. */}
            <DialogClose className="absolute right-4 top-4.5">
              <NavigationMenuButton size={20} isOpen={isOpen} />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
};
