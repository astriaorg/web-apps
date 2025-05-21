import { useEffect, useState } from "react";
import { type Hash } from "viem";
import { useAccount, useConfig, useWaitForTransactionReceipt } from "wagmi";

import { TokenInputState, TransactionStatus } from "@repo/flame-types";
import { useAstriaChainData } from "config";
import {
  createNonfungiblePositionManagerService,
  NonfungiblePositionManagerService,
} from "features/evm-wallet";
import { PoolToken } from "pool/types";

import { usePoolPositionContext } from ".";

export const useCollectFeesTransaction = (
  tokens: PoolToken[],
  isCollectAsWrappedNative: boolean,
) => {
  const { tokenId } = usePoolPositionContext();
  const { address } = useAccount();
  const config = useConfig();
  const { chain } = useAstriaChainData();
  const [status, setStatus] = useState<TransactionStatus>(
    TransactionStatus.IDLE,
  );
  const [hash, setHash] = useState<Hash | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const { data: transactionData } = useWaitForTransactionReceipt({
    hash: hash,
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

  const formatFeesToCollectToTokenInputState = (
    tokens: PoolToken[],
  ): TokenInputState[] => {
    return tokens.map((data) => {
      return {
        token: data.token,
        value: data.unclaimedFees?.toString() || "0",
      };
    });
  };

  const tokenInputs = formatFeesToCollectToTokenInputState(tokens);

  const collectFees = async () => {
    if (
      !address ||
      tokens.length === 0 ||
      !tokenId ||
      !tokenInputs[0] ||
      !tokenInputs[1]
    ) {
      console.warn("Missing required data for collecting fees");
      return;
    }

    try {
      setStatus(TransactionStatus.PENDING);
      const nonfungiblePositionService =
        createNonfungiblePositionManagerService(
          config,
          chain.contracts.nonfungiblePositionManager.address,
        );

      const collectFeesParams =
        NonfungiblePositionManagerService.getCollectFeesParams(
          chain,
          tokenId,
          tokenInputs[0],
          tokenInputs[1],
          address,
          isCollectAsWrappedNative,
        );

      const tx =
        await nonfungiblePositionService.collectFees(collectFeesParams);
      setHash(tx);
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        console.warn(error);
        setError("Transaction rejected.");
        setStatus(TransactionStatus.FAILED);
      } else {
        console.warn(error);
        setError("Error collecting fees.");
        setStatus(TransactionStatus.FAILED);
      }
    }
  };

  return {
    status,
    hash,
    error,
    setStatus,
    setError,
    collectFees,
  };
};
