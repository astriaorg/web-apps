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
import { PoolToken } from "pool/types";

import { usePoolPositionContext } from ".";

export const useRemoveLiquidityTransaction = (
  tokens: PoolToken[],
  isCollectAsWrappedNative: boolean,
  percentageToRemove: number,
) => {
  const { tokenId, position } = usePoolPositionContext();
  const { address } = useAccount();
  const config = useConfig();
  const { chain } = useAstriaChainData();

  const [status, setStatus] = useState<TransactionStatus>(
    TransactionStatus.IDLE,
  );
  const [hash, setHash] = useState<Hash | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const { defaultSlippageTolerance } = useAppConfig();
  const slippageTolerance = getSlippageTolerance() || defaultSlippageTolerance;
  const { data: transactionData } = useWaitForTransactionReceipt({
    hash: hash,
  });

  useEffect(() => {
    if (!hash) return;
    if (transactionData?.status === "success") {
      setStatus(TransactionStatus.SUCCESS);
    } else if (transactionData?.status === "reverted") {
      setStatus(TransactionStatus.FAILED);
      setError("Transaction reverted");
    } else if (transactionData?.status === "error") {
      setStatus(TransactionStatus.FAILED);
      setError("Transaction failed");
    }
  }, [transactionData, hash, setStatus]);

  const formatLiquidityToRemoveToTokenInputState = (
    tokens: PoolToken[],
  ): TokenInputState[] => {
    return tokens.map((data) => {
      const value = data.liquidity;
      return {
        token: data.token,
        value: value.toString(),
      };
    });
  };

  const tokenInputs = formatLiquidityToRemoveToTokenInputState(tokens);

  const removeLiquidity = async () => {
    if (
      !address ||
      !tokens ||
      tokens.length === 0 ||
      !tokenId ||
      !tokenInputs[0] ||
      !tokenInputs[1] ||
      !position
    ) {
      console.warn("Missing required data for removing liquidity");
      return;
    }

    const rawLiquidityToRemove =
      percentageToRemove === 100
        ? position.liquidity
        : (position.liquidity * BigInt(Math.round(percentageToRemove))) / 100n;

    try {
      setStatus(TransactionStatus.PENDING);

      const nonfungiblePositionService =
        createNonfungiblePositionManagerService(
          config,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const params =
        NonfungiblePositionManagerService.getDecreaseLiquidityAndCollectParams(
          tokenId,
          rawLiquidityToRemove,
          tokenInputs[0],
          tokenInputs[1],
          address,
          slippageTolerance,
          chain,
          isCollectAsWrappedNative,
        );

      const response =
        await nonfungiblePositionService.decreaseLiquidityAndCollect(params);

      setHash(response);
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        console.warn(error);
        setStatus(TransactionStatus.FAILED);
        setError("Transaction rejected.");
      } else {
        console.warn(error);
        setStatus(TransactionStatus.FAILED);
        setError("Error removing liquidity.");
      }
    }
  };

  return {
    status,
    hash,
    error,
    setStatus,
    setError,
    removeLiquidity,
  };
};
