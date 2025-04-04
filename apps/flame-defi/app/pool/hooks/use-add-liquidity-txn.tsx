import { ErrorWithMessage, HexString, TXN_STATUS } from "@repo/flame-types";
import { useEvmChainData } from "config";
import { useEffect, useState } from "react";
import { useAccount, useConfig, useWaitForTransactionReceipt } from "wagmi";
import { useConfig as useAppConfig } from "config";
import { getSlippageTolerance, needToReverseTokenOrder } from "@repo/ui/utils";
import { createNonFungiblePositionService } from "features/evm-wallet";
import { usePoolPositionContext } from "./use-pool-position-context";
import { useParams } from "next/navigation";
import { getOrderedTokenAmounts } from "@repo/ui/utils";

export const useAddLiquidityTxn = (inputOne: string, inputTwo: string) => {
  const params = useParams();
  const tokenId = params["token-id"] as string;
  const { address } = useAccount();
  const wagmiConfig = useConfig();
  const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);
  const [txnHash, setTxnHash] = useState<HexString | undefined>(undefined);
  const [errorText, setErrorText] = useState<string | null>(null);

  const { selectedChain } = useEvmChainData();
  const { poolToken0, poolToken1 } = usePoolPositionContext();
  const { chainId } = selectedChain;
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
      !tokenId ||
      parseFloat(inputOne) <= 0 ||
      parseFloat(inputTwo) <= 0
    ) {
      console.warn("Missing required data for increasing liquidity");
      return;
    }
    const token0Address = poolToken0.token.isNative
      ? selectedChain.contracts.wrappedNativeToken.address
      : poolToken0.token.erc20ContractAddress;
    const token1Address = poolToken1.token.isNative
      ? selectedChain.contracts.wrappedNativeToken.address
      : poolToken1.token.erc20ContractAddress;

    if (!token0Address || !token1Address) {
      console.error("Token addresses are missing");
      return;
    }

    const orderedTokenAmounts = getOrderedTokenAmounts(
      inputOne,
      inputTwo,
      token0Address,
      token1Address,
      poolToken0.token.coinDecimals,
      poolToken1.token.coinDecimals,
      slippageTolerance,
    );

    if (!orderedTokenAmounts) {
      console.warn("Invalid token amounts");
      setErrorText("Invalid token amounts");
      return;
    }

    try {
      setTxnStatus(TXN_STATUS.PENDING);
      const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes from now
      let value: bigint | undefined = undefined;
      const reverseTokenOrder = needToReverseTokenOrder(
        token0Address,
        token1Address,
      );

      if (poolToken0.token.isNative && !reverseTokenOrder) {
        // If token0 is native and not reversed
        value = orderedTokenAmounts.amount0Desired;
      } else if (poolToken1.token.isNative && reverseTokenOrder) {
        // If token0 is native after reversing
        value = orderedTokenAmounts.amount0Desired;
      } else if (poolToken1.token.isNative && !reverseTokenOrder) {
        // If token1 is native and not reversed
        value = orderedTokenAmounts.amount1Desired;
      } else if (poolToken0.token.isNative && reverseTokenOrder) {
        // If token1 is native after reversing
        value = orderedTokenAmounts.amount1Desired;
      }

      const nonFungiblePositionService = createNonFungiblePositionService(
        wagmiConfig,
        selectedChain.contracts.nonfungiblePositionManager.address,
      );

      const tx = await nonFungiblePositionService.increaseLiquidity(
        chainId,
        tokenId,
        orderedTokenAmounts.amount0Desired,
        orderedTokenAmounts.amount1Desired,
        orderedTokenAmounts.amount0Min,
        orderedTokenAmounts.amount1Min,
        deadline,
        value,
      );

      setTxnHash(tx);
    } catch (error) {
      if ((error as ErrorWithMessage).message.includes("User rejected")) {
        console.warn(error);
        setErrorText("User rejected transaction");
        setTxnStatus(TXN_STATUS.FAILED);
        return null;
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
