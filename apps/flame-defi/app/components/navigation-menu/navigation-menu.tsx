"use client";

import { FlameIcon } from "@repo/ui/icons";
import { LINKS } from "components/footer/links";
import { useConfig } from "config";
import { usePathname } from "next/navigation";
import { ConnectWalletsButton } from "./connect-wallets-button";
import { MobileNavigationMenu } from "./mobile-navigation-menu";
import { NavigationMenuLink } from "./navigation-menu-link";
import { NetworkSelect } from "./network-select";

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
          <NavigationMenuLink href="/" isActive={pathname === LINKS.BRIDGE}>
            Bridge
          </NavigationMenuLink>
          <NavigationMenuLink
            href={LINKS.SWAP}
            isActive={pathname.startsWith(LINKS.SWAP)}
          >
            Swap
          </NavigationMenuLink>
          {featureFlags.poolEnabled && (
            <NavigationMenuLink
              href={LINKS.POOL}
              isActive={pathname.startsWith(LINKS.POOL)}
            >
              Pool
            </NavigationMenuLink>
          )}
          {featureFlags.earnEnabled && (
            <>
              <NavigationMenuLink
                href={LINKS.EARN}
                isActive={pathname.startsWith(LINKS.EARN)}
              >
                Earn
              </NavigationMenuLink>
              <NavigationMenuLink
                href={LINKS.BORROW}
                isActive={pathname.startsWith(LINKS.BORROW)}
              >
                Borrow
              </NavigationMenuLink>
            </>
          )}
        </div>
      </div>
      <div className="hidden lg:flex gap-2 items-center">
        <NetworkSelect />
        <ConnectWalletsButton />
      </div>
      <MobileNavigationMenu />
    </nav>
  );
};
