import { Button, type ButtonProps } from "@repo/ui/components";
import { useEvmWallet } from "features/evm-wallet";
import { useCallback } from "react";
import { useAccount } from "wagmi";

export const WalletActionButton = ({
  children,
  onClick,
  ...props
}: ButtonProps) => {
  const { connectEvmWallet } = useEvmWallet();
  const { isConnected } = useAccount();

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      if (isConnected) {
        onClick?.(event);
      } else {
        connectEvmWallet();
      }
    },
    [isConnected, onClick, connectEvmWallet],
  );

  return (
    <Button onClick={handleClick} {...props}>
      {isConnected ? children : "Connect Wallet"}
    </Button>
  );
};
