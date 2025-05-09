import { useMemo } from "react";

import { Button } from "@repo/ui/components";

import { useBridgeApproval } from "../../hooks/use-bridge-approval";
import { ChainConnection } from "../../types";

type SubmitButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  buttonText: string;
  loadingText?: string;
  className?: string;
  // used to check if source token needs approval
  sourceConnection: ChainConnection;
  amountInput?: string;
};

export const SubmitButton = ({
  onClick,
  isLoading,
  isDisabled,
  buttonText,
  loadingText = "Processing...",
  className = "w-full",
  sourceConnection,
  amountInput,
}: SubmitButtonProps) => {
  const { needsApproval, isCheckingApproval, isApproving, approveToken } =
    useBridgeApproval({
      chainConnection: sourceConnection,
      amountInput,
    });

  const buttonTextDerived = useMemo(() => {
    if (isLoading || isCheckingApproval) {
      return loadingText;
    }
    if (isApproving) {
      return "Approving...";
    }
    if (needsApproval) {
      return "Approve Token for Spend";
    }
    return buttonText;
  }, [
    buttonText,
    isLoading,
    loadingText,
    needsApproval,
    isCheckingApproval,
    isApproving,
  ]);

  const isProcessing = isLoading || isCheckingApproval || isApproving;

  const handleClick = async () => {
    if (needsApproval) {
      try {
        await approveToken();
      } catch (error) {
        console.error("Failed to approve token:", error);
      }
    } else {
      onClick();
    }
  };

  const isDisabledDerived = useMemo(() => {
    if (isProcessing) {
      return true;
    }
    if (needsApproval) {
      // we need to enable the button so they can click to approve
      return false;
    }
    return isDisabled;
  }, [isDisabled, isProcessing, needsApproval]);

  return (
    <div className="flex flex-col gap-3 mt-8">
      <div className="w-full">
        <Button
          variant="gradient"
          onClick={handleClick}
          disabled={isDisabledDerived}
          className={className}
        >
          {buttonTextDerived}
        </Button>
      </div>
    </div>
  );
};
