import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components";
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
      <Dialog open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DialogTrigger asChild>
          <NavigationMenuButton size={20} isOpen={isOpen} />
        </DialogTrigger>
        {/* Hide the default close button so we can use a custom close button. */}
        <DialogContent className="max-w-screen h-screen [&_button[aria-label='Close']]:hidden">
          <DialogTitle className="sr-only">Flame Apps</DialogTitle>
          <div className="flex flex-col items-center justify-center space-y-8">
            <MobileNavigationMenuLink href="/" isActive={pathname === "/"}>
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
        </DialogContent>
      </Dialog>
    </div>
  );
};
