import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAstriaChainData } from "config";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Hash, parseUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import {
  ApproveStatus,
  type EvmCurrency,
  TransactionStatus,
} from "@repo/flame-types";
import { type Amount, Button } from "@repo/ui/components";
import { ValidateTokenAmountErrorType } from "@repo/ui/hooks";
import { useApproveToken } from "hooks/use-token-approve";
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

  const { getIsApproved, approve } = useApproveToken();

  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [status, setStatus] = useState<TransactionStatus>();
  const [isCheckingApproval, setIsCheckingApproval] = useState(false);
  const [approveStatusToken0, setApproveStatusToken0] = useState<ApproveStatus>(
    ApproveStatus.REQUIRED,
  );
  const [approveStatusToken1, setApproveStatusToken1] = useState<ApproveStatus>(
    ApproveStatus.REQUIRED,
  );

  useEffect(() => {
    if (!token0 || !token1 || amount0.value === "" || amount1.value === "") {
      return;
    }

    // TODO: Check is mounted.
    (async () => {
      setIsCheckingApproval(true);

      const isToken0Approved = await getIsApproved({
        token: token0,
        amount: amount0.value,
        spender: chain.contracts.nonfungiblePositionManager.address,
      });
      const isToken1Approved = await getIsApproved({
        token: token1,
        amount: amount1.value,
        spender: chain.contracts.nonfungiblePositionManager.address,
      });

      setApproveStatusToken0(
        isToken0Approved ? ApproveStatus.SUCCESS : ApproveStatus.REQUIRED,
      );
      setApproveStatusToken1(
        isToken1Approved ? ApproveStatus.SUCCESS : ApproveStatus.REQUIRED,
      );

      setIsCheckingApproval(false);
    })();
  }, [
    getIsApproved,
    token0,
    token1,
    amount0.value,
    amount1.value,
    chain.contracts,
  ]);

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

  const handleOnSubmit = useCallback(async () => {
    if (!token0 || !token1 || !amount0.value || !amount1.value) {
      return;
    }

    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    if (
      depositType === DepositType.BOTH ||
      depositType === DepositType.TOKEN_0_ONLY
    ) {
      if (approveStatusToken0 === ApproveStatus.REQUIRED) {
        handleApproveToken({
          token: token0,
          amount: amount0, // TODO: Should we just send max approval?
        });
        return;
      }
    }

    if (
      depositType === DepositType.BOTH ||
      depositType === DepositType.TOKEN_1_ONLY
    ) {
      if (approveStatusToken1 === ApproveStatus.REQUIRED) {
        handleApproveToken({
          token: token1,
          amount: amount1,
        });
        return;
      }
    }

    // If no approvals are needed or approvals are complete, create the position.
    handleCreatePosition();
  }, [
    token0,
    token1,
    amount0,
    amount1,
    isConnected,
    depositType,
    handleCreatePosition,
    openConnectModal,
    approveStatusToken0,
    approveStatusToken1,
    handleApproveToken,
  ]);

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

    if (!pool) {
      if (!amountInitialPrice.validation.isValid) {
        return ButtonState.INVALID_INPUT;
      }
    }

    if (!token0 || !token1) {
      return ButtonState.INVALID_INPUT;
    }

    const getButtonStateFromAmountValidation = (
      amount: Amount,
      status: ApproveStatus,
      token: EvmCurrency,
    ) => {
      if (!amount.validation.isValid) {
        if (
          amount.value !== "" &&
          amount.validation.errors?.some(
            (error) =>
              error.type === ValidateTokenAmountErrorType.INSUFFICIENT_BALANCE,
          )
        ) {
          return ButtonState.INSUFFICIENT_BALANCE;
        }
        return ButtonState.INVALID_INPUT;
      }

      if (!isCheckingApproval) {
        if (status === ApproveStatus.PENDING) {
          if (token === token0) {
            return ButtonState.PENDING_APPROVE_TOKEN_0;
          }
          return ButtonState.PENDING_APPROVE_TOKEN_1;
        }
        if (status === ApproveStatus.REQUIRED) {
          if (token === token0) {
            return ButtonState.APPROVE_TOKEN_0;
          }
          return ButtonState.APPROVE_TOKEN_1;
        }
      }

      return ButtonState.SEND_TRANSACTION;
    };

    let state0 = ButtonState.SEND_TRANSACTION;
    let state1 = ButtonState.SEND_TRANSACTION;

    if (
      depositType === DepositType.BOTH ||
      depositType !== DepositType.TOKEN_1_ONLY
    ) {
      state0 = getButtonStateFromAmountValidation(
        amount0,
        approveStatusToken0,
        token0,
      );
    }
    if (
      depositType === DepositType.BOTH ||
      depositType !== DepositType.TOKEN_0_ONLY
    ) {
      state1 = getButtonStateFromAmountValidation(
        amount1,
        approveStatusToken1,
        token1,
      );
    }

    // If any of the states are not SEND_TRANSACTION, return the one that is not.
    if (state0 !== ButtonState.SEND_TRANSACTION) {
      return state0;
    }
    if (state1 !== ButtonState.SEND_TRANSACTION) {
      return state1;
    }

    return ButtonState.SEND_TRANSACTION;
  }, [
    amount0,
    amount1,
    token0,
    token1,
    amountInitialPrice.validation.isValid,
    isPriceRangeValid,
    approveStatusToken0,
    approveStatusToken1,
    isCheckingApproval,
    pool,
    depositType,
    isConnected,
    status,
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
      isCheckingApproval ||
      state === ButtonState.INSUFFICIENT_BALANCE ||
      state === ButtonState.PENDING_APPROVE_TOKEN_0 ||
      state === ButtonState.PENDING_APPROVE_TOKEN_1 ||
      state === ButtonState.PENDING_SEND_TRANSACTION ||
      state === ButtonState.INVALID_INPUT
    );
  }, [isCheckingApproval, state]);

  return (
    <Button onClick={handleOnSubmit} disabled={isDisabled}>
      {content}
    </Button>
  );
};
