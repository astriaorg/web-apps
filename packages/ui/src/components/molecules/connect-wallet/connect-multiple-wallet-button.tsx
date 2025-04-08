import { type ButtonProps } from "../../atoms/button";

interface ConnectWalletButtonProps extends ButtonProps {
  label: React.ReactNode;
  icon: React.ReactNode;
  onConnectWallet?: () => void;
}

export const ConnectMultipleWalletButton = ({
  icon,
  label,
  onConnectWallet,
  ...props
}: ConnectWalletButtonProps) => {
  return (
    <button
      className="flex items-center justify-start gap-2 p-2 rounded-lg text-sm text-typography-subdued font-medium hover:bg-surface-3 hover:text-typography-default [&_svg]:size-6"
      onClick={onConnectWallet}
      {...props}
    >
      {icon}
      {label}
    </button>
  );
};
