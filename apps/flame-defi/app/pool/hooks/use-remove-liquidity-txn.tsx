import { useEffect, useState } from "react";
import { type Hash } from "viem";
import { useAccount, useConfig, useWaitForTransactionReceipt } from "wagmi";

import { TokenInputState, TXN_STATUS } from "@repo/flame-types";
import { getSlippageTolerance } from "@repo/ui/utils";
import { useAstriaChainData, useConfig as useAppConfig } from "config";
import {
  createNonfungiblePositionManagerService,
  NonfungiblePositionManagerService,
} from "features/evm-wallet";
import { PoolToken } from "pool/types";

import { usePoolPositionContext } from ".";

export const useRemoveLiquidityTxn = (
  liquidityToRemove: PoolToken[],
  isCollectAsWrappedNative: boolean,
  percentageToRemove: number,
) => {
  const { positionNftId, poolPosition } = usePoolPositionContext();
  const { address } = useAccount();
  const wagmiConfig = useConfig();
  const { chain } = useAstriaChainData();
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);
  const [txnHash, setTxnHash] = useState<Hash | undefined>(undefined);
  const [errorText, setErrorText] = useState<string | null>(null);
  const { defaultSlippageTolerance } = useAppConfig();
  const slippageTolerance = getSlippageTolerance() || defaultSlippageTolerance;
  const { data: transactionData } = useWaitForTransactionReceipt({
    hash: txnHash,
  });

  useEffect(() => {
    if (!txnHash) return;
    if (transactionData?.status === "success") {
      setTxnStatus(TXN_STATUS.SUCCESS);
    } else if (transactionData?.status === "reverted") {
      setTxnStatus(TXN_STATUS.FAILED);
      setErrorText("Transaction reverted");
    } else if (transactionData?.status === "error") {
      setTxnStatus(TXN_STATUS.FAILED);
      setErrorText("Transaction failed");
    }
  }, [transactionData, txnHash, setTxnStatus]);

  const formatLiquidityToRemoveToTokenInputState = (
    liquidityToRemove: PoolToken[],
  ): TokenInputState[] => {
    return liquidityToRemove.map((data) => {
      const value = data.liquidity;
      return {
        token: data.token,
        value: value.toString(),
      };
    });
  };

  const tokenInputs =
    formatLiquidityToRemoveToTokenInputState(liquidityToRemove);

  const removeLiquidity = async () => {
    if (
      !address ||
      !liquidityToRemove ||
      liquidityToRemove.length === 0 ||
      !positionNftId ||
      !tokenInputs[0] ||
      !tokenInputs[1] ||
      !poolPosition
    ) {
      console.warn("Missing required data for removing liquidity");
      return;
    }

    const rawLiquidityToRemove =
      percentageToRemove === 100
        ? poolPosition.liquidity
        : (poolPosition.liquidity * BigInt(Math.round(percentageToRemove))) /
          100n;

    try {
      setTxnStatus(TXN_STATUS.PENDING);

      const nonfungiblePositionService =
        createNonfungiblePositionManagerService(
          wagmiConfig,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const params =
        NonfungiblePositionManagerService.getDecreaseLiquidityAndCollectParams(
          positionNftId,
          rawLiquidityToRemove,
          tokenInputs[0],
          tokenInputs[1],
          address,
          slippageTolerance,
          chain,
          isCollectAsWrappedNative,
        );

      const tx =
        await nonfungiblePositionService.decreaseLiquidityAndCollect(params);

      setTxnHash(tx);
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        console.warn(error);
        setTxnStatus(TXN_STATUS.FAILED);
        setErrorText("Transaction rejected");
      } else {
        console.warn(error);
        setTxnStatus(TXN_STATUS.FAILED);
        setErrorText("Error removing liquidity");
      }
    }
  };

  return {
    removeLiquidity,
    txnStatus,
    txnHash,
    errorText,
    setTxnStatus,
    setErrorText,
  };
};
