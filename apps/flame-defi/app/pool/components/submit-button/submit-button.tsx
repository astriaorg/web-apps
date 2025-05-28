import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useCallback, useMemo } from "react";
import { useAccount } from "wagmi";

import { Button, type ButtonProps } from "@repo/ui/components";

export const SubmitButton = ({
  children: propsChildren,
  disabled: propsDisabled,
  onClick,
  ...props
}: ButtonProps) => {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const handleClick = useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      if (!isConnected) {
        openConnectModal?.();
        return;
      }

      onClick?.(event);
    },
    [isConnected, onClick, openConnectModal],
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
