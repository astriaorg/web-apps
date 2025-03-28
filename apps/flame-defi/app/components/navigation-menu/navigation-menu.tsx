"use client";

import { FlameIcon } from "@repo/ui/icons";
import ConnectWalletsButton from "components/connect-wallets-button/connect-wallets-button";
import { ROUTES } from "components/footer/routes";
import { useConfig } from "config";
import { usePathname } from "next/navigation";
import NetworkSelector from "../network-selector/network-selector";
import { MobileNavigationMenu } from "./mobile-navigation-menu";
import { NavigationMenuLink } from "./navigation-menu-link";

export const NavigationMenu = () => {
  const pathname = usePathname();
  const { brandURL, featureFlags } = useConfig();

  return (
    <nav
      className="flex items-center justify-between px-4 py-2 w-full h-14 bg-background-default"
      aria-label="Navigation"
      role="navigation"
    >
      <div className="flex flex-1 items-center">
        <a
          target="_blank"
          href={brandURL}
          className="flex items-center w-8 h-8 overflow-hidden mr-12"
          rel="noreferrer"
          aria-label="Flame Logo"
        >
          <FlameIcon size={32} className="text-typography-default scale-175" />
        </a>
        <div className="items-center space-x-8 hidden lg:flex">
          <NavigationMenuLink href="/" isActive={pathname === ROUTES.BRIDGE}>
            Bridge
          </NavigationMenuLink>
          <NavigationMenuLink
            href={ROUTES.SWAP}
            isActive={pathname.startsWith(ROUTES.SWAP)}
          >
            Swap
          </NavigationMenuLink>
          {featureFlags.poolEnabled && (
            <NavigationMenuLink
              href={ROUTES.POOL}
              isActive={pathname.startsWith(ROUTES.POOL)}
            >
              Pool
            </NavigationMenuLink>
          )}
          {featureFlags.earnEnabled && (
            <>
              <NavigationMenuLink
                href={ROUTES.EARN}
                isActive={pathname.startsWith(ROUTES.EARN)}
              >
                Earn
              </NavigationMenuLink>
              <NavigationMenuLink
                href={ROUTES.BORROW}
                isActive={pathname.startsWith(ROUTES.BORROW)}
              >
                Borrow
              </NavigationMenuLink>
            </>
          )}
        </div>
      </div>
      <div className="hidden lg:flex gap-6 items-center">
        <NetworkSelector />
        <ConnectWalletsButton />
      </div>
      <MobileNavigationMenu />
    </nav>
  );
};
