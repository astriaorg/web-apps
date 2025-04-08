import { cn } from "../../../utils";
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
        "flex items-center justify-start gap-2 whitespace-nowrap px-6 py-3 rounded-md text-sm  font-medium hover:bg-surface-3 [&_svg]:size-4",
        "lg:px-2 lg:py-2 lg:rounded-lg lg:[&_svg]:size-6",
      )}
      onClick={props.onConnectWallet}
    >
      {props.icon}
      {props.label}
    </button>
  );
};
