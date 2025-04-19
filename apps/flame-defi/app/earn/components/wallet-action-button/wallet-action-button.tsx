import { Button, type ButtonProps } from "@repo/ui/components";
import { useAstriaWallet } from "features/evm-wallet";
import { useCallback } from "react";
import { useAccount } from "wagmi";

export const WalletActionButton = ({
  children,
  onClick,
  ...props
}: ButtonProps) => {
  const { connectWallet } = useAstriaWallet();
  const { isConnected } = useAccount();

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      if (isConnected) {
        onClick?.(event);
      } else {
        connectWallet();
      }
    },
    [isConnected, onClick, connectWallet],
  );

  return (
    <Button onClick={handleClick} {...props}>
      {isConnected ? children : "Connect Wallet"}
    </Button>
  );
};
