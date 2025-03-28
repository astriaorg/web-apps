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
      Company: [
        { name: "About Us", href: ROUTES.ABOUT },
        { name: "Careers", href: ROUTES.CAREERS },
        { name: "Blog", href: ROUTES.BLOG },
        { name: "Terms", href: ROUTES.TERMS },
        { name: "Privacy", href: ROUTES.PRIVACY },
        { name: "Media Kit", href: ROUTES.MEDIA_KIT },
      ],
      Developers: [
        { name: "Docs", href: ROUTES.DOCS },
        { name: "Audits", href: ROUTES.AUDITS },
        { name: "Explorer", href: ROUTES.EXPLORER },
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
        <div className="py-8 px-6 md:px-8 grid grid-cols-2 md:grid-cols-3 md:max-w-[600px] gap-8">
          {Object.entries(items).map(([category, links]) => (
            <div key={`footer_category-${category}`}>
              <h3 className="mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={`footer_category-${category}_link-${index}`}>
                    <a href={link.href}>{link.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="px-6 md:px-8 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FlameIcon className="w-4" aria-label="Flame Logo" />
            <p className="text-xs">
              <span>
                {`© ${new Date().getFullYear()} `}
                <a
                  href="https://www.astria.org/"
                  className="text-brand hover:underline"
                >
                  Astria.org
                </a>
                .
              </span>
              <span> All rights reserved.</span>
            </p>
          </div>
          <div>
            <NetworkStatus />
          </div>
        </div>
      </section>
    </footer>
  );
};
