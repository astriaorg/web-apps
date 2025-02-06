"use client";

import { FlameIcon } from "@repo/ui/icons";
import ConnectWalletsButton from "components/ConnectWalletsButton/ConnectWalletsButton";
import { useConfig } from "config";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileNav from "../MobileNav/MobileNav";
import NetworkSelector from "../NetworkSelector/NetworkSelector";

function Navbar() {
  const pathname = usePathname();
  const { brandURL } = useConfig();

  const navLinkClasses = (path: string) => `
    relative px-4 py-2 text-grey-light hover:text-white
    hover:after:content-[''] hover:after:absolute hover:after:bottom-[-22px]
    hover:after:left-1/2 hover:after:transform hover:after:-translate-x-1/2
    hover:after:w-[85%] hover:after:h-1 hover:after:bg-[#9CA3AF]
    ${
      pathname === path
        ? `
      text-white
      after:content-[''] after:absolute after:bottom-[-22px]
      after:left-1/2 after:transform after:-translate-x-1/2
      after:w-[85%] after:h-1 after:bg-gradient-to-r
      after:from-[#EA9B57] after:to-[#CB513F]
    `
        : ""
    }
  `;

  return (
    <nav
      className="flex justify-between border-b border-[#2A2A2A] px-4 lg:px-12 py-4 w-full bg-black"
      aria-label="main navigation"
    >
      <div className="flex items-center">
        <a
          target="_blank"
          href={brandURL}
          className="flex flex-1 items-center pl-0 p-2 px-3 md:w-[290px]"
          rel="noreferrer"
        >
          <Image
            src="/assets/logo-flame-w-text.svg"
            width={161}
            height={32}
            alt="Flame Logo"
            className="hidden lg:block"
            priority
          />
          <FlameIcon size={36} className="block lg:hidden" />
        </a>
      </div>
      <div id="topNavbar" className="flex-1 hidden md:block">
        <div className="flex justify-center items-center font-mono font-medium">
          <Link href="/" className={navLinkClasses("/")}>
            BRIDGE
          </Link>
          <Link href="/swap" className={navLinkClasses("/swap")}>
            SWAP
          </Link>
          <Link href="/pool" className={navLinkClasses("/pool")}>
            POOL
          </Link>
          <Link href="/earn" className={navLinkClasses("/earn")}>
            EARN
          </Link>
        </div>
      </div>
      <div className="hidden md:flex gap-6 items-center">
        <NetworkSelector />
        <ConnectWalletsButton />
      </div>
      <MobileNav />
    </nav>
  );
}

export default Navbar;
