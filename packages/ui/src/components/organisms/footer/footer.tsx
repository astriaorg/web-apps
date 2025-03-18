"use client";

import type React from "react";
import { NetworkStatus } from "./network-status";

export const Footer = (): React.ReactElement => {
  return (
    <footer className="w-full pt-20 pb-10">
      <div className="relative text-center">
        <div className="absolute right-4 bottom-0">
          <NetworkStatus />
        </div>
        <p>
          &copy; 2025. All Rights Reserved.{" "}
          <a
            href="https://www.astria.org/"
            className="text-orange-soft hover:underline"
          >
            Astria.org
          </a>
        </p>
        <p>
          <a
            target="_blank"
            href="https://www.astria.org/terms"
            rel="noreferrer"
            className="text-orange-soft hover:underline"
          >
            Terms of Service.
          </a>{" "}
          <a
            target="_blank"
            href="https://www.astria.org/privacy"
            rel="noreferrer"
            className="text-orange-soft hover:underline"
          >
            Privacy Policy.
          </a>
        </p>
      </div>
    </footer>
  );
};
