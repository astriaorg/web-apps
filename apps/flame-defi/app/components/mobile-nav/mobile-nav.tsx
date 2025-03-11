import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@repo/ui/shadcn-primitives";
import MobileWalletConnect from "components/mobile-wallet-connect/mobile-wallet-connect";
import { useConfig } from "config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { featureFlags } = useConfig();

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="flex items-center gap-4 md:hidden">
      <MobileWalletConnect handleClose={handleClose} />
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="bottom">
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            className="p-2 hover:bg-transparent focus-visible:bg-transparent active:bg-transparent"
          >
            <div className="flex flex-col gap-1.5 w-6">
              <div
                className={`h-0.5 bg-current transition-all ${
                  isOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <div
                className={`h-0.5 bg-current transition-all ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <div
                className={`h-0.5 bg-current transition-all ${
                  isOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </div>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-radial-dark pb-12">
          <div className="p-8 pt-4 pb-0 flex flex-col items-start">
            <div className="text-center text-white text-base font-semibold">
              Flame Apps
            </div>
            <div className="flex flex-col items-baseline space-y-4 mt-4">
              <Link
                href="/"
                className={`font-medium text-grey-light text-base ${pathname === "/" ? "text-orange-soft" : ""}`}
              >
                Bridge
              </Link>
              <Link
                href="/swap"
                className={`font-medium text-grey-light text-base ${pathname === "/swap" ? "text-orange-soft" : ""}`}
              >
                Swap
              </Link>
              <Link
                href="/pool"
                className={`font-medium text-grey-light text-base ${pathname === "/pool" ? "text-orange-soft" : ""}`}
              >
                Pool
              </Link>
              {featureFlags.earnEnabled && (
                <>
                  <Link
                    href="/earn"
                    className={`font-medium text-grey-light text-base ${pathname === "/earn" ? "text-orange-soft" : ""}`}
                  >
                    Earn
                  </Link>
                  <Link
                    href="/borrow"
                    className={`font-medium text-grey-light text-base ${pathname === "/borrow" ? "text-orange-soft" : ""}`}
                  >
                    Borrow
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="pt-4 pb-0 px-8 flex flex-col items-start">
            <Accordion type="single" collapsible>
              <AccordionItem value="docs-details" className="border-b-0 pb-4">
                <AccordionTrigger className="no-underline hover:no-underline flex items-center justify-start p-0 [&>svg]:h-6 [&>svg]:w-6">
                  <div className="text-white text-base font-semibold mr-1 mb-1">
                    Docs
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col items-baseline space-y-4 mt-4">
                    <a
                      href="https://docs.astria.org/flame/flame-mainnet-alpha"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-grey-light text-base"
                    >
                      Flame
                    </a>
                    <a
                      href="https://docs.astria.org/overview/introduction"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-grey-light text-base"
                    >
                      Learn
                    </a>
                    <a
                      href="https://docs.astria.org/developer/astria-go/astria-go-installation"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-grey-light text-base"
                    >
                      Developers
                    </a>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="company-details" className="border-b-0">
                <AccordionTrigger className="no-underline hover:no-underline flex items-center justify-start p-0 [&>svg]:h-6 [&>svg]:w-6">
                  <div className="text-white text-base font-semibold mr-1 mb-1">
                    Company
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col items-baseline space-y-4 mt-4">
                    <a
                      href="https://www.astria.org/about"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-grey-light text-base"
                    >
                      About
                    </a>
                    <a
                      href="https://job-boards.greenhouse.io/astria"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-grey-light text-base"
                    >
                      Careers
                    </a>
                    <a
                      href="https://www.astria.org/blog"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-grey-light text-base"
                    >
                      Blog
                    </a>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default MobileNav;
