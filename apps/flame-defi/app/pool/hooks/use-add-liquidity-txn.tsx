import { HexString, TokenInputState, TXN_STATUS } from "@repo/flame-types";
import { useEvmChainData } from "config";
import { useEffect, useState } from "react";
import { useAccount, useConfig, useWaitForTransactionReceipt } from "wagmi";
import { useConfig as useAppConfig } from "config";
import { getSlippageTolerance } from "@repo/ui/utils";
import { createNonfungiblePositionManagerService } from "features/evm-wallet";
import { usePoolPositionContext } from "./use-pool-position-context";
import { NonfungiblePositionManagerService } from "../../features/evm-wallet/services/non-fungible-position-manager-service";

export const useAddLiquidityTxn = (
  input0Amount: string,
  input1Amount: string,
) => {
  const { address } = useAccount();
  const wagmiConfig = useConfig();
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);
  const [txnHash, setTxnHash] = useState<HexString | undefined>(undefined);
  const [errorText, setErrorText] = useState<string | null>(null);

  const { selectedChain } = useEvmChainData();
  const { poolToken0, poolToken1, positionNftId } = usePoolPositionContext();
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

  const addLiquidity = async () => {
    if (
      !address ||
      !poolToken0 ||
      !poolToken1 ||
      !positionNftId ||
      parseFloat(input0Amount) <= 0 ||
      parseFloat(input1Amount) <= 0
    ) {
      console.warn("Missing required data for increasing liquidity");
      return;
    }

    const tokenInput0: TokenInputState = {
      token: poolToken0.token,
      value: input0Amount,
    };
    const tokenInput1: TokenInputState = {
      token: poolToken1.token,
      value: input1Amount,
    };

    const increaseLiquidityParams =
      NonfungiblePositionManagerService.getIncreaseLiquidityParams(
        tokenInput0,
        tokenInput1,
        slippageTolerance,
        selectedChain,
      );

    try {
      setTxnStatus(TXN_STATUS.PENDING);
      const NonfungiblePositionManagerService =
        createNonfungiblePositionManagerService(
          wagmiConfig,
          selectedChain.contracts.nonfungiblePositionManager.address,
        );

      const tx = await NonfungiblePositionManagerService.increaseLiquidity(
        positionNftId,
        increaseLiquidityParams,
      );
      setTxnHash(tx);
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        console.warn(error);
        setErrorText("Transaction rejected");
        setTxnStatus(TXN_STATUS.FAILED);
      } else {
        console.warn(error);
        setErrorText("Error increasing liquidity");
        setTxnStatus(TXN_STATUS.FAILED);
      }
    }
  };

  return {
    txnStatus,
    txnHash,
    errorText,
    setErrorText,
    setTxnStatus,
    addLiquidity,
  };
};
