import { HexString, TXN_STATUS, TokenInputState } from "@repo/flame-types";
import { useEvmChainData } from "config";
import { useEffect, useState } from "react";
import { useAccount, useConfig, useWaitForTransactionReceipt } from "wagmi";
import { useConfig as useAppConfig } from "config";
import { getSlippageTolerance } from "@repo/ui/utils";
import { createNonfungiblePositionManagerService } from "features/evm-wallet";
import {
  NonfungiblePositionManagerService,
  MintParams,
} from "../../features/evm-wallet/services/non-fungible-position-manager-service";
import { FeeData } from "pool/types";

export const useMintNewPosition = (
  input0: TokenInputState,
  input1: TokenInputState,
  feeTierData: FeeData,
) => {
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

  const mintNewPosition = async () => {
    if (
      !address ||
      !input0.token ||
      !input1.token ||
      !feeTierData.tickLower ||
      !feeTierData.tickUpper ||
      !feeTierData.feeTier
    ) {
      console.error("Missing required data for adding liquidity");
      return;
    }

    try {
      setTxnStatus(TXN_STATUS.PENDING);

      const nonfungiblePositionManagerService =
        createNonfungiblePositionManagerService(
          wagmiConfig,
          selectedChain.contracts.nonfungiblePositionManager.address,
        );

      const tokenInput0: TokenInputState = {
        token: input0.token,
        value: input0.value,
      };
      const tokenInput1: TokenInputState = {
        token: input1.token,
        value: input1.value,
      };

      //   Use the static getMintParams helper function directly from the class
      const mintParams: MintParams =
        NonfungiblePositionManagerService.getMintParams(
          tokenInput0,
          tokenInput1,
          feeTierData.feeTier,
          feeTierData.tickLower,
          feeTierData.tickUpper,
          slippageTolerance,
          address,
          selectedChain,
        );

      // Use the streamlined mintPosition method that accepts a MintParams object
      const tx =
        await nonfungiblePositionManagerService.mintPosition(mintParams);

      setTxnHash(tx);
      setTxnStatus(TXN_STATUS.SUCCESS);
    } catch (error) {
      console.error("Error minting new position:", error);
      setTxnStatus(TXN_STATUS.FAILED);
    }
  };

  return {
    txnStatus,
    setTxnStatus,
    txnHash,
    mintNewPosition,
    errorText,
  };
};
