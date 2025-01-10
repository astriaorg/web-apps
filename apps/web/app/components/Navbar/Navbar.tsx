"use client";

import type React from "react";
import { useState } from "react";

import { NetworkSelector, useConfig } from "../../config";
import ConnectWalletsButton from "../ConnectWalletsButton/ConnectWalletsButton";
import Link from "next/link";
// import logo from "logo-flame-w-text.svg";

function Navbar() {
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

  const onHamburgerClick = (_: React.SyntheticEvent<HTMLButtonElement>) => {
    setIsMobileMenuActive((prev) => !prev);
  };

  const { brandURL, swapURL, poolURL } = useConfig();

  return (
    <nav
      className="navbar is-spaced is-transparent"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <a
          target="_blank"
          href={brandURL}
          className="navbar-item"
          rel="noreferrer"
        >
          {/* <img src={logo} width="161" height="32" alt="logo" /> */}
        </a>
        <button
          type="button"
          className={`navbar-burger ${isMobileMenuActive && "is-active"}`}
          aria-label="menu"
          aria-expanded="false"
          data-target="topNavbar"
          onClick={onHamburgerClick}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div
        id="topNavbar"
        className={`navbar-menu ${
          isMobileMenuActive && "navbar-menu-dropdown is-active"
        }`}
      >
        <div className="navbar-middle has-text-weight-medium is-family-monospace">
          {/* TODO - show correct active tab after moving swap and pool pages here */}
          <Link href="/" className="navbar-item is-active">
            BRIDGE
          </Link>
          <a href={swapURL} className="navbar-item" rel="noreferrer">
            SWAP
          </a>
          <a href={poolURL} className="navbar-item" rel="noreferrer">
            POOL
          </a>
        </div>
        <div className="navbar-end">
          <NetworkSelector />
          <ConnectWalletsButton />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
