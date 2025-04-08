import { ConnectWalletContent } from "./connect-wallet-content";

interface ConnectMultipleWalletsProps {
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
  explorer?: {
    url: string;
  };
  label: React.ReactNode;
  icon: React.ReactNode;
  onConnectWallet?: () => void;
  onDisconnectWallet: () => void;
}

export const ConnectMultipleWallets = (props: ConnectMultipleWalletsProps) => {
  return props.isConnected ? (
    <ConnectWalletContent {...props} collapsible />
  ) : (
    <button
      className="flex items-center justify-start gap-2 whitespace-nowrap p-2 rounded-lg text-sm text-typography-subdued font-medium hover:bg-surface-3 hover:text-typography-default [&_svg]:size-6"
      onClick={props.onConnectWallet}
    >
      {props.icon}
      {props.label}
    </button>
  );
};
