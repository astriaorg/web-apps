import type { AccordionSingleProps } from "@radix-ui/react-accordion";
import { FormattedNumber } from "react-intl";
import { CopyIcon, PowerIcon, ShareRightIcon } from "../../../icons";
import { cn } from "../../../utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../atoms/accordion";
import { Skeleton } from "../../atoms/skeleton";
import { CopyToClipboard } from "../copy-to-clipboard";
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
  return (
    <Accordion
      type="single"
      // Force the accordion to stay opened for single wallets.
      value={!isCollapsible ? "wallet" : undefined}
      {...props}
    >
      <AccordionItem value="wallet">
        <div className="flex items-center justify-between w-full md:min-w-[300px]">
          <AccordionTrigger
            className={cn(
              "p-2 text-typography-subdued font-medium",
              // Hide the caret icon if the wallet is not collapsible, in the case of single wallets.
              !props.collapsible && "[&>svg]:hidden",
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
                <CopyIcon aria-label="Copy" />
              </CopyToClipboard>
            )}
            {explorer && (
              <a href={explorer.url} target="_blank" rel="noreferrer">
                <ShareRightIcon aria-label="Explorer" />
              </a>
            )}
            <button type="button" onClick={() => onDisconnectWallet()}>
              <PowerIcon aria-label="Disconnect" />
            </button>
          </div>
        </div>
        <AccordionContent className="pl-8 md:pl-10">
          <div className="flex flex-col gap-2">
            <Skeleton isLoading={isLoading}>
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
            <Skeleton isLoading={isLoading}>
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
