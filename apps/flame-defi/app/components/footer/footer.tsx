"use client";

import { FlameIcon } from "@repo/ui/icons/polychrome";
import { useConfig } from "config";
import type React from "react";
import { useMemo } from "react";
import { NetworkStatus } from "./network-status";
import { ROUTES } from "./routes";

export const Footer = (): React.ReactElement => {
  const { featureFlags } = useConfig();

  const items = useMemo<{
    [key: string]: {
      name: string;
      href: string;
    }[];
  }>(() => {
    return {
      App: [
        { name: "Bridge", href: ROUTES.BRIDGE },
        { name: "Swap", href: ROUTES.SWAP },
        ...(featureFlags.poolEnabled
          ? [{ name: "Pool", href: ROUTES.POOL }]
          : []),
        ...(featureFlags.earnEnabled
          ? [
              { name: "Earn", href: ROUTES.EARN },
              { name: "Borrow", href: ROUTES.BORROW },
            ]
          : []),
      ],
      Developers: [
        { name: "Docs", href: ROUTES.DOCS },
        { name: "Audits", href: ROUTES.AUDITS },
        { name: "Explorer", href: ROUTES.EXPLORER },
      ],
      Company: [
        { name: "About Us", href: ROUTES.ABOUT },
        { name: "Careers", href: ROUTES.CAREERS },
        { name: "Blog", href: ROUTES.BLOG },
        { name: "Terms", href: ROUTES.TERMS },
        { name: "Privacy", href: ROUTES.PRIVACY },
        { name: "Media Kit", href: ROUTES.MEDIA_KIT },
      ],
    };
  }, [featureFlags]);

  // TODO: Add social links if required.
  // const socials = useMemo<{
  //     icon: React.ReactNode;
  //     href: string;
  // }[]>(() => {
  //   return [
  //       { icon: , href: ROUTES.SOCIAL_GITHUB },
  //   ];
  // }, []);

  return (
    <footer className="w-full mt-8 [&_li]:text-sm [&_li]:text-typography-light [&_li]:hover:text-typography-default">
      <section>
        <div className="py-8 px-6 md:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-20">
            {Object.entries(items).map(([category, links]) => (
              <div key={`footer_category-${category}`}>
                <h3 className="mb-4">{category}</h3>
                <ul className="space-y-2">
                  {links.map((link, index) => (
                    <li key={`footer_category-${category}_link-${index}`}>
                      <a
                        href={link.href}
                        {...(!link.href.startsWith("/") && {
                          rel: "noreferrer",
                          target: "_blank",
                        })}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="px-6 md:px-8 py-2 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center space-x-2 order-2 mb-4 md:order-1 md:mb-0">
            <FlameIcon className="w-4" aria-label="Flame Logo" />
            <p className="text-xs text-center md:text-left">
              <span>
                {`© ${new Date().getFullYear()} `}
                <a
                  href="https://www.astria.org"
                  className="text-brand hover:underline"
                  rel="noreferrer"
                  target="_blank"
                >
                  Astria.org
                </a>
                .
              </span>
              <span> All rights reserved.</span>
            </p>
          </div>
          <div className="order-1 md:order-2">
            <NetworkStatus />
          </div>
        </div>
      </section>
    </footer>
  );
};
