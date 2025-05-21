import { useCallback, useMemo, useState } from "react";
import { type Hash, maxUint256, parseUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { type EvmCurrency, TransactionStatus } from "@repo/flame-types";
import { type Amount, Button } from "@repo/ui/components";
import { ValidateTokenAmountErrorType } from "@repo/ui/hooks";
import { getSlippageTolerance } from "@repo/ui/utils";
import { Environment, useAstriaChainData, useConfig } from "config";
import {
  CreateAndInitializePoolIfNecessaryAndMintParams,
  useAstriaWallet,
} from "features/evm-wallet";
import { getMaxBigInt } from "features/evm-wallet/services/services.utils";
import { useApproveToken } from "hooks/use-approve-token";
import { useTokenAllowance } from "hooks/use-token-allowance";
import { useCreateAndInitializePoolIfNecessaryAndMint } from "pool/hooks/use-mint";
import { usePageContext } from "pool/modules/create-position/hooks/use-page-context";
import { DepositType } from "pool/types";
import { calculateNearestTickAndPrice } from "pool/utils";

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
  CONNECT_WALLET = "CONNECT_WALLET",
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
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { connectWallet } = useAstriaWallet();
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

  const { mint } = useCreateAndInitializePoolIfNecessaryAndMint();
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

  // TODO: Error handling.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hash, setHash] = useState<string | null>(null);
  const [status, setStatus] = useState<TransactionStatus>();

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
          const receipt = await publicClient.waitForTransactionReceipt({
            hash,
          });

          if (receipt.status === "success") {
            // Add a small delay to ensure blockchain state is updated.
            await new Promise((resolve) => setTimeout(resolve, 2000));

            await refetch();

            setStatus(TransactionStatus.SUCCESS);

            return;
          } else {
            throw new Error("Transaction failed.");
          }
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
      const amount0Desired = parseUnits(
        amount0.value || "0",
        token0.coinDecimals,
      );
      const amount1Desired = parseUnits(
        amount1.value || "0",
        token1.coinDecimals,
      );

      /**
       * TODO: Use slippage calculation in `TokenAmount` class.
       * Too bulky to use here for now, wait until the class is refactored to implement it.
       */
      const calculateAmountWithSlippage = (amount: bigint) => {
        // Convert slippage to basis points (1 bp = 0.01%)
        // Example: 0.1% = 10 basis points
        const basisPoints = Math.round(slippageTolerance * 100);

        // Calculate: amount * (10000 - basisPoints) / 10000
        return (amount * BigInt(10000 - basisPoints)) / BigInt(10000);
      };

      const amount0Min = calculateAmountWithSlippage(amount0Desired);
      const amount1Min = calculateAmountWithSlippage(amount1Desired);

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

      // 20 minute deadline.
      // TODO: Add this to settings.
      const deadline = Math.floor(Date.now() / 1000) + 20 * 60;

      const params: CreateAndInitializePoolIfNecessaryAndMintParams = {
        chain,
        token0,
        token1,
        fee: feeTier,
        tickLower: Number(tickLower),
        tickUpper: Number(tickUpper),
        amount0Desired: getMaxBigInt(amount0Desired, BigInt(1)),
        amount1Desired: getMaxBigInt(amount1Desired, BigInt(1)),
        amount0Min: getMaxBigInt(amount0Min, BigInt(1)),
        amount1Min: getMaxBigInt(amount1Min, BigInt(1)),
        recipient: address,
        deadline: BigInt(deadline),
        sqrtPriceX96,
      };

      await mint(params);

      setError(null);
      setStatus(TransactionStatus.SUCCESS);
      setHash("0x0" as Hash);
    } catch (error) {
      console.error("Error creating position:", error);
      setError("Failed to create position.");
      setStatus(TransactionStatus.FAILED);
      setHash(null);
    }
  }, [
    address,
    chain,
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
    if (!isConnected) {
      return ButtonState.CONNECT_WALLET;
    }

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
    isConnected,
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

  const handleSubmit = useCallback(async () => {
    if (state === ButtonState.CONNECT_WALLET) {
      connectWallet();
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
    state,
    token0,
    token1,
    amount0,
    amount1,
    connectWallet,
    handleCreatePosition,
    handleApproveToken,
    refetchToken0Allowance,
    refetchToken1Allowance,
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
    <Button onClick={handleSubmit} disabled={isDisabled}>
      {content}
    </Button>
  );
};
