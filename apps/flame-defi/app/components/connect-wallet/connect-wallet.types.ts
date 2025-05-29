export interface ConnectWalletProps {
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
