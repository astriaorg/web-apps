"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { NetworkSelector, useConfig } from "config";
import ConnectWalletsButton from "components/ConnectWalletsButton/ConnectWalletsButton";

function Navbar() {
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

  const pathname = usePathname();

  const onHamburgerClick = () => {
    setIsMobileMenuActive((prev) => !prev);
  };

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
      className="flex border-b border-[#2A2A2A] px-12 py-4 w-full"
      aria-label="main navigation"
    >
      <div className="flex items-center">
        <a
          target="_blank"
          href={brandURL}
          className="flex items-center pl-0 p-2 px-3 w-[290px]"
          rel="noreferrer"
        >
          <Image
            src="/assets/logo-flame-w-text.svg"
            width={161}
            height={32}
            alt="Flame Logo"
            priority
          />
        </a>
        <button
          type="button"
          className={`md:hidden p-2 ${isMobileMenuActive ? "is-active" : ""}`}
          aria-label="menu"
          aria-expanded="false"
          data-target="topNavbar"
          onClick={onHamburgerClick}
        >
          <span
            className="block w-6 h-0.5 bg-white mb-1.5"
            aria-hidden="true"
          />
          <span
            className="block w-6 h-0.5 bg-white mb-1.5"
            aria-hidden="true"
          />
          <span className="block w-6 h-0.5 bg-white" aria-hidden="true" />
        </button>
      </div>
      <div
        id="topNavbar"
        className={`flex-1 ${isMobileMenuActive ? "block" : "hidden md:block"}`}
      >
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
        </div>
      </div>
      <div className="navbar-end flex gap-6 items-center ">
        <NetworkSelector />
        <ConnectWalletsButton />
      </div>
    </nav>
  );
}

export default Navbar;
