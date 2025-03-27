"use client";

import { FlameIcon } from "@repo/ui/icons";
import ConnectWalletsButton from "components/connect-wallets-button/connect-wallets-button";
import { useConfig } from "config";
import { usePathname } from "next/navigation";
import MobileNav from "../mobile-nav/mobile-nav";
import NetworkSelector from "../network-selector/network-selector";
import { NavbarLink } from "./navbar-link";

const Navbar = () => {
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
        >
          <FlameIcon size={32} className="text-typography-default scale-175" />
        </a>
        <div className="flex items-center space-x-8 h-full">
          <NavbarLink href="/" isActive={pathname === "/"}>
            Bridge
          </NavbarLink>
          <NavbarLink href="/swap" isActive={pathname.startsWith("/swap")}>
            Swap
          </NavbarLink>
          {featureFlags.poolEnabled && (
            <NavbarLink href="/pool" isActive={pathname.startsWith("/pool")}>
              Pool
            </NavbarLink>
          )}
          {featureFlags.earnEnabled && (
            <>
              <NavbarLink href="/earn" isActive={pathname.startsWith("/earn")}>
                Earn
              </NavbarLink>
              <NavbarLink
                href="/borrow"
                isActive={pathname.startsWith("/borrow")}
              >
                Borrow
              </NavbarLink>
            </>
          )}
        </div>
      </div>
      <div className="hidden md:flex gap-6 items-center">
        <NetworkSelector />
        <ConnectWalletsButton />
      </div>
      <MobileNav />
    </nav>
  );
};

export default Navbar;
