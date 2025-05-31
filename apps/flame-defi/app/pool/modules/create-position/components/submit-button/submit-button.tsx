import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { type Hash, maxUint256, parseUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { type EvmCurrency, TransactionStatus } from "@repo/flame-types";
import { type Amount } from "@repo/ui/components";
import { ValidateTokenAmountErrorType } from "@repo/ui/hooks";
import { getSlippageTolerance } from "@repo/ui/utils";
import { ConfirmationModal } from "components/confirmation-modal-v2";
import { Environment, useAstriaChainData, useConfig } from "config";
import {
  type CreateAndInitializePoolIfNecessaryAndMintParams,
} from "features/evm-wallet";
import { useApproveToken } from "hooks/use-approve-token";
import { useTokenAllowance } from "hooks/use-token-allowance";
import { SubmitButton as BaseSubmitButton } from "pool/components/submit-button";
import {
  TransactionSummary,
  TransactionType,
} from "pool/components/transaction-summary";
import { ROUTES } from "pool/constants/routes";
import { useMint } from "pool/hooks/use-mint";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";
import { DepositType } from "pool/types";
import {
  calculateNearestTickAndPrice,
  getIncreaseLiquidityAmounts,
} from "pool/utils";

interface BaseSubmitButtonProps {
  amount0: Amount;
  amount1: Amount;
  depositType: DepositType;
}

interface InitializedPoolSubmitButtonProps extends BaseSubmitButtonProps {
  sqrtPriceX96: null;
}
interface UninitializedPoolSubmitButtonProps extends BaseSubmitButtonProps {
  sqrtPriceX96: bigint;
}

type SubmitButtonProps =
  | InitializedPoolSubmitButtonProps
  | UninitializedPoolSubmitButtonProps;

// TODO: Split into generic button state and pool-specific button states.
enum ButtonState {
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  INVALID_INPUT = "INVALID_INPUT",

  APPROVE_TOKEN_0 = "APPROVE_TOKEN_0",
  APPROVE_TOKEN_1 = "APPROVE_TOKEN_1",

  SEND_TRANSACTION = "SEND_TRANSACTION",
  PENDING_SEND_TRANSACTION = "PENDING_SEND_TRANSACTION",
}

export const SubmitButton = ({
  amount0,
  amount1,
  sqrtPriceX96,
  depositType,
}: SubmitButtonProps) => {
  const router = useRouter();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { chain } = useAstriaChainData();
  const {
    token0,
    token1,
    maxPrice,
    minPrice,
    isPriceRangeValid,
    amountInitialPrice,
    feeTier,
  } = usePageContext();

  const { defaultSlippageTolerance, environment } = useConfig();
  const slippageTolerance = getSlippageTolerance() || defaultSlippageTolerance;

  const { mint } = useMint();
  const { approve, getIsApproved } = useApproveToken();

  const {
    data: token0Allowance,
    isPending: isPendingToken0Allowance,
    refetch: refetchToken0Allowance,
  } = useTokenAllowance({
    token: token0,
    spender: chain.contracts.nonfungiblePositionManager.address,
  });
  const {
    data: token1Allowance,
    isPending: isPendingToken1Allowance,
    refetch: refetchToken1Allowance,
  } = useTokenAllowance({
    token: token1,
    spender: chain.contracts.nonfungiblePositionManager.address,
  });

  const isToken0Approved = useMemo(() => {
    if (
      !token0 ||
      typeof token0Allowance !== "bigint" ||
      isPendingToken0Allowance ||
      !amount0.validation.isValid
    ) {
      return false;
    }

    return getIsApproved({
      allowance: token0Allowance,
      amount: amount0.value,
      token: token0,
    });
  }, [
    token0,
    token0Allowance,
    amount0,
    isPendingToken0Allowance,
    getIsApproved,
  ]);
  const isToken1Approved = useMemo(() => {
    if (
      !token1 ||
      typeof token1Allowance !== "bigint" ||
      isPendingToken1Allowance ||
      !amount1.validation.isValid
    ) {
      return false;
    }
    return getIsApproved({
      allowance: token1Allowance,
      amount: amount1.value,
      token: token1,
    });
  }, [
    token1,
    token1Allowance,
    amount1,
    isPendingToken1Allowance,
    getIsApproved,
  ]);

  const [hash, setHash] = useState<Hash>();
  const [error, setError] = useState<Error>();
  const [status, setStatus] = useState<TransactionStatus>(
    TransactionStatus.IDLE,
  );
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);

  const handleApproveToken = useCallback(
    async ({
      token,
      amount,
      refetch,
    }: {
      token: EvmCurrency;
      amount: Amount;
      refetch: () => Promise<unknown>;
    }) => {
      if (!address || !publicClient) {
        return;
      }

      setStatus(TransactionStatus.PENDING);

      try {
        const hash = await approve({
          token,
          spender: chain.contracts.nonfungiblePositionManager.address,
          amount:
            environment === Environment.DEVELOP
              ? parseUnits(amount.value, token.coinDecimals)
              : maxUint256,
        });

        if (hash) {
          await refetch();

          setStatus(TransactionStatus.SUCCESS);

          return;
        }
      } catch (error) {
        console.error("Error approving token:", error);
      }

      setStatus(TransactionStatus.FAILED);
    },
    [address, environment, publicClient, chain.contracts, approve],
  );

  const handleCreatePosition = useCallback(async () => {
    if (!address || !token0 || !token1 || !amount0 || !amount1) {
      return;
    }

    setStatus(TransactionStatus.PENDING);

    try {
      const {
        amount0Min,
        amount1Min,
        amount0Desired,
        amount1Desired,
        deadline,
      } = getIncreaseLiquidityAmounts({
        amount0: amount0.value,
        amount1: amount1.value,
        token0,
        token1,
        depositType,
        slippageTolerance,
      });

      let { tick: tickLower } = calculateNearestTickAndPrice({
        price: Number(minPrice),
        token0,
        token1,
        feeTier,
      });
      let { tick: tickUpper } = calculateNearestTickAndPrice({
        price: Number(maxPrice),
        token0,
        token1,
        feeTier,
      });

      if (tickLower > tickUpper) {
        [tickLower, tickUpper] = [tickUpper, tickLower];
      }

      const params: CreateAndInitializePoolIfNecessaryAndMintParams = {
        chainId: chain.chainId,
        token0,
        token1,
        fee: feeTier,
        tickLower,
        tickUpper,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        recipient: address,
        deadline: BigInt(deadline),
        sqrtPriceX96,
      };

      const hash = await mint(params);

      setHash(hash);
      setStatus(TransactionStatus.SUCCESS);
    } catch (error) {
      console.error("Error creating position:", error);
      if (error instanceof Error) {
        setError(error);
      }
      setStatus(TransactionStatus.FAILED);
    }
  }, [
    address,
    chain.chainId,
    depositType,
    feeTier,
    token0,
    token1,
    amount0,
    amount1,
    minPrice,
    maxPrice,
    slippageTolerance,
    sqrtPriceX96,
    mint,
  ]);

  const state = useMemo<ButtonState>(() => {
    if (status === TransactionStatus.PENDING) {
      return ButtonState.PENDING_SEND_TRANSACTION;
    }

    if (!isPriceRangeValid) {
      return ButtonState.INVALID_INPUT;
    }

    if (sqrtPriceX96 !== null && !amountInitialPrice.validation.isValid) {
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
    status,
    isPriceRangeValid,
    sqrtPriceX96,
    amountInitialPrice.validation.isValid,
    token0,
    token1,
    depositType,
    amount0,
    amount1,
    isToken0Approved,
    isToken1Approved,
  ]);

  const handleCloseConfirmationModal = useCallback(() => {
    setIsConfirmationModalOpen(false);
    setStatus(TransactionStatus.IDLE);
    setError(undefined);
  }, [setIsConfirmationModalOpen, setStatus, setError]);

  const handleOpenConfirmationModal = useCallback(() => {
    setIsConfirmationModalOpen(true);
    setStatus(TransactionStatus.IDLE);
  }, [setStatus]);

  const handleSubmit = useCallback(async () => {
    if (!address) {
      handleCloseConfirmationModal();
      return;
    }

    if (state === ButtonState.APPROVE_TOKEN_0) {
      if (!token0 || !amount0.validation.isValid) {
        return;
      }

      handleApproveToken({
        token: token0,
        amount: amount0,
        refetch: refetchToken0Allowance,
      });

      return;
    }

    if (state === ButtonState.APPROVE_TOKEN_1) {
      if (!token1 || !amount1.validation.isValid) {
        return;
      }

      handleApproveToken({
        token: token1,
        amount: amount1,
        refetch: refetchToken1Allowance,
      });

      return;
    }

    // If no approvals are needed or approvals are complete, create the position.
    handleCreatePosition();
  }, [
    address,
    state,
    token0,
    token1,
    amount0,
    amount1,
    handleCreatePosition,
    handleCloseConfirmationModal,
    handleApproveToken,
    refetchToken0Allowance,
    refetchToken1Allowance,
  ]);

  const content = useMemo<string>(() => {
    const action = "Create New Position";

    switch (state) {
      case ButtonState.INSUFFICIENT_BALANCE:
        return "Insufficient Balance";
      case ButtonState.INVALID_INPUT:
        return action;
      case ButtonState.APPROVE_TOKEN_0:
        return `Approve ${token0?.coinDenom}`;
      case ButtonState.APPROVE_TOKEN_1:
        return `Approve ${token1?.coinDenom}`;
      case ButtonState.PENDING_SEND_TRANSACTION:
        return "Sending Transaction...";
      case ButtonState.SEND_TRANSACTION:
        return action;
    }
  }, [state, token0?.coinDenom, token1?.coinDenom]);

  const isDisabled = useMemo(() => {
    return (
      isPendingToken0Allowance ||
      isPendingToken1Allowance ||
      [
        ButtonState.INSUFFICIENT_BALANCE,
        ButtonState.PENDING_SEND_TRANSACTION,
        ButtonState.INVALID_INPUT,
      ].includes(state)
    );
  }, [isPendingToken0Allowance, isPendingToken1Allowance, state]);

  return (
    <>
      <BaseSubmitButton
        onClick={handleOpenConfirmationModal}
        disabled={isDisabled}
      >
        {content}
      </BaseSubmitButton>
      {token0 && token1 && (
        <ConfirmationModal
          title="Create New Position"
          open={isConfirmationModalOpen}
          onOpenChange={(value) => {
            if (!value && status === TransactionStatus.SUCCESS) {
              router.push(ROUTES.POSITION_LIST);
              return;
            }
            setIsConfirmationModalOpen(value);
          }}
        >
          <TransactionSummary
            type={TransactionType.CREATE_POSITION}
            token0={token0}
            token1={token1}
            hash={hash}
            status={status}
            error={error}
            onSubmit={handleSubmit}
            amount0={amount0.value}
            amount1={amount1.value}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </ConfirmationModal>
      )}
    </>
  );
};
