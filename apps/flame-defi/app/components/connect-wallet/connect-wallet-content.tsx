import type { AccordionSingleProps } from "@radix-ui/react-accordion";
import { FormattedNumber } from "react-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  CopyToClipboard,
  Skeleton,
} from "@repo/ui/components";
import { CopyIcon, PowerIcon, ShareRightIcon } from "@repo/ui/icons";
import { cn } from "@repo/ui/utils";

import type { ConnectWalletProps } from "./connect-wallet.types";

interface ConnectWalletContentProps
  extends ConnectWalletProps,
    Omit<AccordionSingleProps, "type" | "value"> {
  isCollapsible?: boolean;
}

export const ConnectWalletContent = ({
  account,
  balance,
  explorer,
  fiat,
  icon,
  isLoading,
  label,
  onDisconnectWallet,
  isCollapsible = true,
  ...props
}: ConnectWalletContentProps) => {
  // Filter out props that shouldn't be passed to the Accordion component to fix DOM errors.
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isConnected,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onConnectWallet,
    ...accordionProps
  } = props;

  return (
    <Accordion
      type="single"
      // Force the accordion to stay opened for single wallets.
      value={!isCollapsible ? "wallet" : undefined}
      {...accordionProps}
    >
      <AccordionItem value="wallet">
        <div className="flex items-center justify-between w-full md:min-w-[300px]">
          <AccordionTrigger
            className={cn(
              "p-2 text-typography-subdued font-medium",
              // Hide the caret icon if the wallet is not collapsible, in the case of single wallets.
              !accordionProps.collapsible && "[&>svg]:hidden",
            )}
          >
            <div className="flex items-center gap-2 mr-2 [&_svg]:size-4 md:[&_svg]:size-6">
              {icon}
              <span>{label}</span>
            </div>
          </AccordionTrigger>
          <div className="flex items-center gap-3 text-icon-subdued mr-2 [&_svg]:cursor-pointer [&_svg]:size-4 [&_svg]:hover:text-typography-default">
            {account?.address && (
              <CopyToClipboard value={account.address}>
                <CopyIcon aria-hidden="true" />
                <span className="sr-only">Copy wallet address</span>
              </CopyToClipboard>
            )}
            {explorer && (
              <a
                href={explorer.url}
                target="_blank"
                rel="noreferrer"
                aria-label="View in explorer"
              >
                <ShareRightIcon aria-hidden="true" />
              </a>
            )}
            <button
              type="button"
              onClick={() => onDisconnectWallet()}
              aria-label="Disconnect wallet"
            >
              <PowerIcon aria-hidden="true" />
            </button>
          </div>
        </div>
        <AccordionContent className="pl-8 md:pl-10">
          <div className="flex flex-col gap-2">
            <Skeleton isLoading={!balance && isLoading}>
              <span className="text-4xl font-dot">
                <FormattedNumber
                  value={Number(balance?.value ?? 0)}
                  minimumFractionDigits={4}
                  maximumFractionDigits={4}
                />
                &nbsp;
                {balance?.symbol}
              </span>
            </Skeleton>
            <Skeleton isLoading={!fiat && isLoading}>
              <span className="text-xs font-normal">
                <FormattedNumber
                  value={Number(fiat?.value ?? 0)}
                  style="currency"
                  currency="USD"
                />
              </span>
            </Skeleton>

            {/* Transactions Section - TODO */}
            {/* <div className="flex items-center">
            <button
              type="button"
              onClick={() => setShowTransactions(!showTransactions)}
            >
              <span>Transactions</span>
              <ChevronDownIcon className="rotate-[270deg]"/>
            </button>

            {showTransactions && (
              <div>
                <div>No recent transactions</div>
              </div>
            )}
          </div> */}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
