import { cn } from "@repo/ui/utils";
import { ConnectWalletContent } from "./connect-wallet-content";
import type { ConnectWalletProps } from "./connect-wallet.types";

export const ConnectMultipleWallets = (props: ConnectWalletProps) => {
  return props.isConnected ? (
    <ConnectWalletContent {...props} collapsible />
  ) : (
    // On large screens, this is shown in a popover so should match the network select popover styling.
    // On small screens, this is shown in a drawer so should match the network select drawer styling.
    <button
      className={cn(
        "flex items-center justify-start gap-2 whitespace-nowrap px-2 py-3 rounded-md text-sm  font-medium text-typography-subdued [&_svg]:size-4",
        "md:py-2 md:rounded-lg md:hover:bg-surface-3 md:text-typography-default md:[&_svg]:size-6",
      )}
      onClick={props.onConnectWallet}
    >
      {props.icon}
      {props.label}
    </button>
  );
};
