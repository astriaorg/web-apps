import { HexString, TXN_STATUS } from "@repo/flame-types";
import { useEvmChainData } from "config";
import { useState } from "react";
import { usePoolPositionContext } from ".";
import { useAccount, useConfig } from "wagmi";
import { useConfig as useAppConfig } from "config";
import { getSwapSlippageTolerance } from "@repo/ui/utils";
import { createNonFungiblePositionService } from "features/evm-wallet";

export const useAddLiquidityTxn = (inputOne: string, inputTwo: string) => {
    const { address } = useAccount();
    const wagmiConfig = useConfig();
    const { selectedChain } = useEvmChainData();
    const { chainId } = selectedChain;
    const { poolTokenOne, poolTokenTwo, rawFeeTier, poolPosition } = usePoolPositionContext();
    const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);
    const [txnHash, setTxnHash] = useState<HexString | undefined>(undefined);
    const { swapSlippageToleranceDefault } = useAppConfig();

    // TODO: Do we want to use global slippage tolerance here? Or have it be feature specific?
    const slippageTolerance = getSwapSlippageTolerance() || swapSlippageToleranceDefault;

    const calculateMinAmountWithSlippage = (amount: string): number => {
        if (!amount || isNaN(Number(amount))) return 0;
        const parsedAmount = parseFloat(amount);
        return parsedAmount * (1 - slippageTolerance / 100);
    };

    const amount0Desired = parseFloat(inputOne) || 0;
    const amount1Desired = parseFloat(inputTwo) || 0;
    const amount0Min = calculateMinAmountWithSlippage(inputOne);
    const amount1Min = calculateMinAmountWithSlippage(inputTwo);

    const addLiquidity = async () => {
        if (!address || !poolTokenOne || !poolTokenTwo || !poolPosition) {
            console.error("Missing required data for adding liquidity");
            return;
        }

        try {
            setTxnStatus(TXN_STATUS.PENDING);
            
            // TODO: Is this what we want?
            // Creates deadline 20 minutes from now
            const deadline = Math.floor(Date.now() / 1000) + 20 * 60;
            
            const nonFungiblePositionService = createNonFungiblePositionService(
                wagmiConfig,
                selectedChain.contracts.nonfungiblePositionManager.address
            );

            const txHash = await nonFungiblePositionService.mint(
                chainId,
                poolTokenOne.tokenAddress,
                poolTokenTwo.tokenAddress,
                rawFeeTier,
                poolPosition.tickLower,
                poolPosition.tickUpper,
                amount0Desired,
                amount1Desired,
                amount0Min,
                amount1Min,
                address,
                deadline
            );

            setTxnHash(txHash);
            setTxnStatus(TXN_STATUS.SUCCESS);
            return txHash;
        } catch (error) {
            console.error("Error adding liquidity:", error);
            setTxnStatus(TXN_STATUS.FAILED);
        }
    };

    return {
        txnStatus,
        txnHash,
        addLiquidity,
        amount0Min,
        amount1Min
    };
}