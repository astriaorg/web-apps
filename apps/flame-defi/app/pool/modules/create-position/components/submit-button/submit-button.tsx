import { useConnectModal } from "@rainbow-me/rainbowkit";
import { TransactionStatus } from "@repo/flame-types";
import { Button } from "@repo/ui/components";
import { ValidateTokenAmountErrorType } from "@repo/ui/hooks";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";
import type { PoolWithSlot0 } from "pool/types";
import { useCallback, useMemo, useState } from "react";
import { Hash } from "viem";
import { useAccount } from "wagmi";

interface SubmitUninitializedPoolProps {
  pool: null;
}

interface SubmitInitializedPoolProps {
  pool: PoolWithSlot0;
}

type SubmitButtonProps =
  | SubmitInitializedPoolProps
  | SubmitUninitializedPoolProps;

// TODO: Split into generic button state and pool-specific button states.
enum ButtonState {
  CONNECT_WALLET = "Connect Wallet",
  INSUFFICIENT_BALANCE = "Insufficient Balance",
  INVALID_INPUT = "Invalid Input",

  APPROVE_TOKEN = "Approve {token}",
  PENDING_APPROVE_TOKEN = "Approving {token}...",

  SEND_TRANSACTION = "Submit",
  PENDING_SEND_TRANSACTION = "Sending Transaction...",
}

export const SubmitButton = ({ pool }: SubmitButtonProps) => {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const {
    amount0,
    amount1,
    token0,
    token1,
    token0Balance,
    token1Balance,
    maxPrice,
    minPrice,
    isPriceRangeValid,
    amountInitialPrice,
  } = usePageContext();

  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [status, setStatus] = useState<TransactionStatus>();

  const handleCreatePosition = useCallback(async () => {
    if (!address) {
      return;
    }

    setStatus(TransactionStatus.PENDING);

    try {
      // TODO: Implement create position logic.
      console.log("Creating position...");
      // Simulate a successful transaction for now.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setError(null);
      setStatus(TransactionStatus.SUCCESS);
      setHash("0x0" as Hash);
    } catch (error) {
      console.error("Error creating position:", error);
      setError("Failed to create position");
      setStatus(TransactionStatus.FAILED);
      setHash(null);
    }
  }, [address]);

  const handleOnSubmit = useCallback(() => {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    handleCreatePosition();
  }, [isConnected, handleCreatePosition, openConnectModal]);

  const state = useMemo<ButtonState>(() => {
    if (!isConnected) {
      return ButtonState.CONNECT_WALLET;
    }

    if (status === TransactionStatus.PENDING) {
      return ButtonState.PENDING_SEND_TRANSACTION;
    }

    // Validate inputs. This is intentionally repetitive for readability.
    if (!amount0.validation.isValid || !amount1.validation.isValid) {
      if (
        amount0.validation.errors?.some(
          (error) =>
            error.type === ValidateTokenAmountErrorType.INSUFFICIENT_BALANCE,
        ) ||
        amount1.validation.errors?.some(
          (error) =>
            error.type === ValidateTokenAmountErrorType.INSUFFICIENT_BALANCE,
        )
      ) {
        return ButtonState.INSUFFICIENT_BALANCE;
      }

      return ButtonState.INVALID_INPUT;
    }

    if (!isPriceRangeValid) {
      return ButtonState.INVALID_INPUT;
    }

    if (!pool) {
      if (!amountInitialPrice.validation.isValid) {
        return ButtonState.INVALID_INPUT;
      }
    }

    return ButtonState.SEND_TRANSACTION;
  }, [
    amount0.validation,
    amount1.validation,
    amountInitialPrice.validation.isValid,
    isPriceRangeValid,
    pool,
    token0Balance,
    token1Balance,
    isConnected,
    status,
  ]);

  const content = useMemo<string>(() => {
    const action = "Create New Position";

    switch (state) {
      case ButtonState.CONNECT_WALLET:
        return ButtonState.CONNECT_WALLET;
      case ButtonState.INSUFFICIENT_BALANCE:
        return ButtonState.INSUFFICIENT_BALANCE;
      case ButtonState.INVALID_INPUT:
        return action;
      case ButtonState.APPROVE_TOKEN:
        return `Approve ${token0?.coinDenom}`;
      case ButtonState.PENDING_APPROVE_TOKEN:
        return ButtonState.PENDING_APPROVE_TOKEN;
      case ButtonState.PENDING_SEND_TRANSACTION:
        return ButtonState.PENDING_SEND_TRANSACTION;
      case ButtonState.SEND_TRANSACTION:
        return action;
    }

    throw new Error(`Unknown button state: ${state}.`);
  }, [state, token0?.coinDenom]);

  const isDisabled = useMemo(() => {
    return (
      state === ButtonState.INSUFFICIENT_BALANCE ||
      state === ButtonState.PENDING_APPROVE_TOKEN ||
      state === ButtonState.PENDING_SEND_TRANSACTION ||
      state === ButtonState.INVALID_INPUT
    );
  }, [state]);

  return (
    <Button onClick={handleOnSubmit} disabled={isDisabled}>
      {content}
    </Button>
  );
};
