import {
  ErrorWithMessage,
  TokenInputState,
  TXN_STATUS,
} from "@repo/flame-types";
import { HexString } from "@repo/flame-types";
import { PoolToken } from "pool/types";
import { useEffect, useState } from "react";
import { useConfig as useAppConfig, useEvmChainData } from "config";
import { useAccount, useConfig, useWaitForTransactionReceipt } from "wagmi";
import { usePoolPositionContext } from ".";
import {
  createNonfungiblePositionManagerService,
  NonfungiblePositionManagerService,
} from "features/evm-wallet";
import { getSlippageTolerance } from "@repo/ui/utils";

export const useRemoveLiquidityTxn = (
  liquidityToRemove: PoolToken[],
  collectAsWrappedNative: boolean,
  percentageToRemove: number,
) => {
  const { positionNftId, poolPosition } = usePoolPositionContext();
  const { address } = useAccount();
  const wagmiConfig = useConfig();
  const { selectedChain } = useEvmChainData();
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);
  const [txnHash, setTxnHash] = useState<HexString | undefined>(undefined);
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

    // Make sure the percentage is valid
    const safePercentage = Math.max(0, Math.min(100, percentageToRemove));

    // Calculate the liquidity to remove based on percentage
    // For 100%, use the full liquidity amount to avoid rounding errors
    const rawLiquidityToRemove =
      safePercentage === 100
        ? poolPosition.liquidity
        : (poolPosition.liquidity * BigInt(Math.round(safePercentage))) / 100n;

    try {
      setTxnStatus(TXN_STATUS.PENDING);

      // Create the service
      const nonfungiblePositionService =
        createNonfungiblePositionManagerService(
          wagmiConfig,
          selectedChain.contracts.nonfungiblePositionManager.address,
        );

      const params =
        NonfungiblePositionManagerService.getDecreaseLiquidityAndCollectParams(
          positionNftId,
          rawLiquidityToRemove,
          tokenInputs[0],
          tokenInputs[1],
          address,
          slippageTolerance,
          selectedChain,
          collectAsWrappedNative,
        );

      const tx =
        await nonfungiblePositionService.decreaseLiquidityAndCollect(params);

      setTxnHash(tx);
    } catch (error) {
      if ((error as ErrorWithMessage).message.includes("User rejected")) {
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
