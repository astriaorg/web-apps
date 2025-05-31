import { useCallback, useMemo } from "react";
import { useAccount } from "wagmi";

import { Button, type ButtonProps } from "@repo/ui/components";
import { useAstriaWallet } from "features/evm-wallet";

export const SubmitButton = ({
  children: propsChildren,
  disabled: propsDisabled,
  onClick,
  ...props
}: ButtonProps) => {
  const { isConnected } = useAccount();
  const { connectWallet } = useAstriaWallet();

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      if (!isConnected) {
        connectWallet();
        return;
      }

      onClick?.(event);
    },
    [isConnected, onClick, connectWallet],
  );

  const children = useMemo(() => {
    if (!isConnected) {
      return "Connect Wallet";
    }

    return propsChildren;
  }, [propsChildren, isConnected]);

  const disabled = useMemo(() => {
    if (!isConnected) {
      // Allow connecting the wallet.
      return false;
    }
    return propsDisabled;
  }, [propsDisabled, isConnected]);

  return (
    <Button disabled={disabled} onClick={handleClick} {...props}>
      {children}
    </Button>
  );
};
