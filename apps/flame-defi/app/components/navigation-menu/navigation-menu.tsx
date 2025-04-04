"use client";

import { FlameIcon } from "@repo/ui/icons";
import ConnectWalletsButton from "components/connect-wallets-button/connect-wallets-button";
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
          <NavigationMenuLink
            href="/"
            isActive={pathname.startsWith("/bridge")}
          >
            Bridge
          </NavigationMenuLink>
          <NavigationMenuLink
            href="/swap"
            isActive={pathname.startsWith("/swap")}
          >
            Swap
          </NavigationMenuLink>
          {featureFlags.poolEnabled && (
            <NavigationMenuLink
              href="/pool"
              isActive={pathname.startsWith("/pool")}
            >
              Pool
            </NavigationMenuLink>
          )}
          {featureFlags.earnEnabled && (
            <>
              <NavigationMenuLink
                href="/earn"
                isActive={pathname.startsWith("/earn")}
              >
                Earn
              </NavigationMenuLink>
              <NavigationMenuLink
                href="/borrow"
                isActive={pathname.startsWith("/borrow")}
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
