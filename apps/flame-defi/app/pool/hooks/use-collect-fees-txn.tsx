import { useEffect, useState } from "react";
import { type Hash } from "viem";
import { useAccount, useConfig, useWaitForTransactionReceipt } from "wagmi";

import { TokenInputState, TXN_STATUS } from "@repo/flame-types";
import { useAstriaChainData } from "config";
import {
  createNonfungiblePositionManagerService,
  NonfungiblePositionManagerService,
} from "features/evm-wallet";
import { PoolToken } from "pool/types";

import { usePoolPositionContext } from ".";

export const useCollectFeesTxn = (
  poolTokens: PoolToken[],
  isCollectAsWrappedNative: boolean,
) => {
  const { positionNftId } = usePoolPositionContext();
  const { address } = useAccount();
  const wagmiConfig = useConfig();
  const { chain } = useAstriaChainData();
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);
  const [txnHash, setTxnHash] = useState<Hash | undefined>(undefined);
  const [errorText, setErrorText] = useState<string | null>(null);
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

  const formatFeesToCollectToTokenInputState = (
    poolTokens: PoolToken[],
  ): TokenInputState[] => {
    return poolTokens.map((data) => {
      return {
        token: data.token,
        value: data.unclaimedFees?.toString() || "0",
      };
    });
  };

  const tokenInputs = formatFeesToCollectToTokenInputState(poolTokens);

  const collectFees = async () => {
    if (
      !address ||
      poolTokens.length === 0 ||
      !positionNftId ||
      !tokenInputs[0] ||
      !tokenInputs[1]
    ) {
      console.warn("Missing required data for collecting fees");
      return;
    }

    try {
      setTxnStatus(TXN_STATUS.PENDING);
      const nonfungiblePositionService =
        createNonfungiblePositionManagerService(
          wagmiConfig,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const collectFeesParams =
        NonfungiblePositionManagerService.getCollectFeesParams(
          chain,
          positionNftId,
          tokenInputs[0],
          tokenInputs[1],
          address,
          isCollectAsWrappedNative,
        );

      const tx =
        await nonfungiblePositionService.collectFees(collectFeesParams);
      setTxnHash(tx);
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        console.warn(error);
        setErrorText("Transaction rejected");
        setTxnStatus(TXN_STATUS.FAILED);
      } else {
        console.warn(error);
        setErrorText("Error collecting fees");
        setTxnStatus(TXN_STATUS.FAILED);
      }
    }
  };

  return {
    txnStatus,
    txnHash,
    errorText,
    setTxnStatus,
    setErrorText,
    collectFees,
  };
};
