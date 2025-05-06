import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAstriaChainData } from "config";
import { useCallback, useMemo, useState } from "react";
import { type Hash, parseUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { type EvmCurrency, TransactionStatus } from "@repo/flame-types";
import { type Amount, Button } from "@repo/ui/components";
import { ValidateTokenAmountErrorType } from "@repo/ui/hooks";
import { useApproveToken } from "hooks/use-approve-token";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";
import { DepositType, PoolWithSlot0 } from "pool/types";

interface SubmitButtonProps {
  amount0: Amount;
  amount1: Amount;
  pool: PoolWithSlot0 | null;
  depositType: DepositType;
}

// TODO: Split into generic button state and pool-specific button states.
enum ButtonState {
  CONNECT_WALLET = "CONNECT_WALLET",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  INVALID_INPUT = "INVALID_INPUT",

  APPROVE_TOKEN_0 = "APPROVE_TOKEN_0",
  PENDING_APPROVE_TOKEN_0 = "PENDING_APPROVE_TOKEN_0",
  APPROVE_TOKEN_1 = "APPROVE_TOKEN_1",
  PENDING_APPROVE_TOKEN_1 = "PENDING_APPROVE_TOKEN_1",

  SEND_TRANSACTION = "SEND_TRANSACTION",
  PENDING_SEND_TRANSACTION = "PENDING_SEND_TRANSACTION",
}

export const SubmitButton = ({
  amount0,
  amount1,
  pool,
  depositType,
}: SubmitButtonProps) => {
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { openConnectModal } = useConnectModal();
  const { chain } = useAstriaChainData();
  const {
    token0,
    token1,
    maxPrice,
    minPrice,
    isPriceRangeValid,
    amountInitialPrice,
  } = usePageContext();

  const { approve, useIsTokenApproved } = useApproveToken();
  const { data: isToken0Approved, isPending: isCheckingToken0Approval } =
    useIsTokenApproved({
      token: token0,
      spender: chain.contracts.nonfungiblePositionManager.address,
      amount: amount0.value,
    });
  const { data: isToken1Approved, isPending: isCheckingToken1Approval } =
    useIsTokenApproved({
      token: token1,
      spender: chain.contracts.nonfungiblePositionManager.address,
      amount: amount1.value,
    });

  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [status, setStatus] = useState<TransactionStatus>();

  const handleApproveToken = useCallback(
    async ({ token, amount }: { token: EvmCurrency; amount: Amount }) => {
      setHash(null);

      if (!address || !publicClient) {
        return;
      }

      setStatus(TransactionStatus.PENDING);

      try {
        const hash = await approve({
          token,
          spender: chain.contracts.nonfungiblePositionManager.address,
          amount: parseUnits(amount.value, token.coinDecimals).toString(),
        });

        if (hash) {
          setHash(hash);
          setStatus(TransactionStatus.SUCCESS);
        }
      } catch (error) {
        console.error("Error approving token:", error);
      }

      setStatus(TransactionStatus.FAILED);
    },
    [address, publicClient, chain.contracts, approve],
  );

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

  const state = useMemo<ButtonState>(() => {
    if (!isConnected) {
      return ButtonState.CONNECT_WALLET;
    }

    if (status === TransactionStatus.PENDING) {
      return ButtonState.PENDING_SEND_TRANSACTION;
    }

    if (!isPriceRangeValid) {
      return ButtonState.INVALID_INPUT;
    }

    if (!pool && !amountInitialPrice.validation.isValid) {
      return ButtonState.INVALID_INPUT;
    }

    if (!token0 || !token1) {
      return ButtonState.INVALID_INPUT;
    }

    if (depositType !== DepositType.TOKEN_1_ONLY) {
      if (!amount0.validation.isValid) {
        if (
          amount0.value !== "" &&
          amount0.validation.errors?.some(
            (error) =>
              error.type === ValidateTokenAmountErrorType.INSUFFICIENT_BALANCE,
          )
        ) {
          return ButtonState.INSUFFICIENT_BALANCE;
        }
        return ButtonState.INVALID_INPUT;
      }

      if (!isToken0Approved) {
        return ButtonState.APPROVE_TOKEN_0;
      }
    }

    if (depositType !== DepositType.TOKEN_0_ONLY) {
      if (!amount1.validation.isValid) {
        if (
          amount1.value !== "" &&
          amount1.validation.errors?.some(
            (error) =>
              error.type === ValidateTokenAmountErrorType.INSUFFICIENT_BALANCE,
          )
        ) {
          return ButtonState.INSUFFICIENT_BALANCE;
        }
        return ButtonState.INVALID_INPUT;
      }

      if (!isToken1Approved) {
        return ButtonState.APPROVE_TOKEN_1;
      }
    }

    return ButtonState.SEND_TRANSACTION;
  }, [
    isConnected,
    status,
    isPriceRangeValid,
    pool,
    amountInitialPrice.validation.isValid,
    token0,
    token1,
    depositType,
    amount0,
    amount1,
    isToken0Approved,
    isToken1Approved,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!token0 || !token1 || !amount0.value || !amount1.value) {
      return;
    }

    if (state === ButtonState.CONNECT_WALLET) {
      openConnectModal?.();
      return;
    }

    if (state === ButtonState.APPROVE_TOKEN_0) {
      handleApproveToken({ token: token0, amount: amount0 });
      return;
    }

    if (state === ButtonState.APPROVE_TOKEN_1) {
      handleApproveToken({ token: token1, amount: amount1 });
      return;
    }

    // If no approvals are needed or approvals are complete, create the position.
    handleCreatePosition();
  }, [
    state,
    token0,
    token1,
    amount0,
    amount1,
    handleCreatePosition,
    openConnectModal,
    handleApproveToken,
  ]);

  const content = useMemo<string>(() => {
    const action = "Create New Position";

    switch (state) {
      case ButtonState.CONNECT_WALLET:
        return "Connect Wallet";
      case ButtonState.INSUFFICIENT_BALANCE:
        return "Insufficient Balance";
      case ButtonState.INVALID_INPUT:
        return action;
      case ButtonState.APPROVE_TOKEN_0:
        return `Approve ${token0?.coinDenom}`;
      case ButtonState.APPROVE_TOKEN_1:
        return `Approve ${token1?.coinDenom}`;
      case ButtonState.PENDING_APPROVE_TOKEN_0:
        return `Approving ${token0?.coinDenom}...`;
      case ButtonState.PENDING_APPROVE_TOKEN_1:
        return `Approving ${token1?.coinDenom}...`;
      case ButtonState.PENDING_SEND_TRANSACTION:
        return "Sending Transaction...";
      case ButtonState.SEND_TRANSACTION:
        return action;
    }
  }, [state, token0?.coinDenom, token1?.coinDenom]);

  const isDisabled = useMemo(() => {
    return (
      isCheckingToken0Approval ||
      isCheckingToken1Approval ||
      [
        ButtonState.INSUFFICIENT_BALANCE,
        ButtonState.PENDING_APPROVE_TOKEN_0,
        ButtonState.PENDING_APPROVE_TOKEN_1,
        ButtonState.PENDING_SEND_TRANSACTION,
        ButtonState.INVALID_INPUT,
      ].includes(state)
    );
  }, [isCheckingToken0Approval, isCheckingToken1Approval, state]);

  return (
    <Button onClick={handleSubmit} disabled={isDisabled}>
      {content}
    </Button>
  );
};
