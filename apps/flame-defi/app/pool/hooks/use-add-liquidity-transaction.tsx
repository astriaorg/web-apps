import { useEffect, useState } from "react";
import { type Hash } from "viem";
import { useAccount, useConfig, useWaitForTransactionReceipt } from "wagmi";

import { TokenInputState, TransactionStatus } from "@repo/flame-types";
import { getSlippageTolerance } from "@repo/ui/utils";
import { useAstriaChainData, useConfig as useAppConfig } from "config";
import {
  createNonfungiblePositionManagerService,
  NonfungiblePositionManagerService,
} from "features/evm-wallet";

import { usePoolPositionContext } from "./use-pool-position-context";

export const useAddLiquidityTransaction = (
  amount0: string,
  amount1: string,
) => {
  const { address } = useAccount();
  const config = useConfig();
  const [status, setStatus] = useState<TransactionStatus>(
    TransactionStatus.IDLE,
  );
  const [hash, setHash] = useState<Hash | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const { chain } = useAstriaChainData();
  const { token0, token1, tokenId } = usePoolPositionContext();
  const { defaultSlippageTolerance } = useAppConfig();
  const slippageTolerance = getSlippageTolerance() || defaultSlippageTolerance;
  const { data: transactionData } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!hash) return;
    if (transactionData?.status === "success") {
      setStatus(TransactionStatus.SUCCESS);
    } else if (transactionData?.status === "reverted") {
      setStatus(TransactionStatus.FAILED);
      setError("Transaction reverted.");
    } else if (transactionData?.status === "error") {
      setStatus(TransactionStatus.FAILED);
      setError("Transaction failed.");
    }
  }, [transactionData, hash, setStatus]);

  const addLiquidity = async () => {
    if (
      !address ||
      !token0 ||
      !token1 ||
      !tokenId ||
      parseFloat(amount0) <= 0 ||
      parseFloat(amount1) <= 0
    ) {
      console.warn("Missing required data for increasing liquidity");
      return;
    }

    const tokenInput0: TokenInputState = {
      token: token0.token,
      value: amount0,
    };
    const tokenInput1: TokenInputState = {
      token: token1.token,
      value: amount1,
    };

    const increaseLiquidityParams =
      NonfungiblePositionManagerService.getIncreaseLiquidityParams(
        tokenInput0,
        tokenInput1,
        slippageTolerance,
        chain,
      );

    try {
      setStatus(TransactionStatus.PENDING);
      const NonfungiblePositionManagerService =
        createNonfungiblePositionManagerService(
          config,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const tx = await NonfungiblePositionManagerService.increaseLiquidity(
        tokenId,
        increaseLiquidityParams,
      );
      setHash(tx);
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        console.warn(error);
        setError("Transaction rejected");
        setStatus(TransactionStatus.FAILED);
      } else {
        console.warn(error);
        setError("Error increasing liquidity");
        setStatus(TransactionStatus.FAILED);
      }
    }
  };

  return {
    status,
    hash,
    error,
    setError,
    setStatus,
    addLiquidity,
  };
};
