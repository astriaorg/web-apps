import { FormattedNumber } from "react-intl";
import { CopyIcon, PowerIcon, ShareRightIcon } from "../../../icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../atoms/accordion";
import { type ButtonProps } from "../../atoms/button";
import { Skeleton } from "../../atoms/skeleton";
import { CopyToClipboard } from "../copy-to-clipboard";

interface ConnectWalletButtonProps extends ButtonProps {
  label: React.ReactNode;
  isConnected: boolean;
  isLoading: boolean;
  account?: {
    address?: string;
  };
  balance?: {
    value: string;
    symbol: string;
  };
  fiat?: {
    value: string;
    symbol: string;
  };
  icon: React.ReactNode;
  explorer?: {
    url: string;
  };
  onConnectWallet?: () => void;
  onDisconnectWallet: () => void;
}

export const ConnectWalletButton = ({
  account,
  balance,
  explorer,
  fiat,
  icon,
  isConnected,
  isLoading,
  label,
  onConnectWallet,
  onDisconnectWallet,
}: ConnectWalletButtonProps) => {
  return isConnected ? (
    <Accordion type="single" collapsible>
      <AccordionItem value="wallet">
        <div className="flex items-center justify-between w-full md:w-[300px]">
          <AccordionTrigger className="p-2 text-typography-subdued font-medium [&_svg]:size-4">
            <div className="flex items-center gap-2 mr-2 [&_svg]:size-6">
              {icon}
              <span>{label}</span>
            </div>
          </AccordionTrigger>
          <div className="flex items-center gap-3 text-icon-subdued [&_svg]:cursor-pointer [&_svg]:size-4 [&_svg]:hover:text-typography-default">
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
        <AccordionContent className="pl-10">
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
  ) : (
    <button
      className="flex items-center justify-start gap-2 p-2 rounded-lg text-sm text-typography-subdued font-medium hover:bg-surface-3 hover:text-typography-default [&_svg]:size-6"
      onClick={onConnectWallet}
    >
      {icon}
      {label}
    </button>
  );
};
