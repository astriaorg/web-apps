// import { HexString, TXN_STATUS } from "@repo/flame-types";
// import { useEvmChainData } from "config";
// import { useState } from "react";
// import { usePoolPositionContext } from ".";
// import { useAccount, useConfig } from "wagmi";
// import { useConfig as useAppConfig } from "config";
// import {
//   getSlippageTolerance,
// } from "@repo/ui/utils";
// import { createNonfungiblePositionManagerService } from "features/evm-wallet";
// import { needToReverseTokenOrder } from "../../features/evm-wallet/services/services.utils";
//
// // TODO: this is a WIP based off of useAddLiquidityTxn and will be refactored when I start work on the new pool position
// export const useMintNewPosition = (
//   inputOneAmount: string,
//   inputTwoAmount: string,
// ) => {
//   const { address } = useAccount();
//   const wagmiConfig = useConfig();
//   const { selectedChain } = useEvmChainData();
//   const { chainId } = selectedChain;
//   const { poolToken0, poolToken1, rawFeeTier, poolPosition } =
//     usePoolPositionContext();
//   const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);
//   const [txnHash, setTxnHash] = useState<HexString | undefined>(undefined);
//   const { defaultSlippageTolerance } = useAppConfig();
//   const slippageTolerance = getSlippageTolerance() || defaultSlippageTolerance;
//
//   const mintNewPosition = async () => {
//     const token0Address = poolToken0?.token.isNative
//       ? selectedChain.contracts.wrappedNativeToken.address
//       : poolToken0?.token.erc20ContractAddress;
//     const token1Address = poolToken1?.token.isNative
//       ? selectedChain.contracts.wrappedNativeToken.address
//       : poolToken1?.token.erc20ContractAddress;
//
//     if (
//       !address ||
//       !poolToken0 ||
//       !poolToken1 ||
//       !poolPosition ||
//       !token0Address ||
//       !token1Address
//     ) {
//       console.error("Missing required data for adding liquidity");
//       return;
//     }
//
//     const { amount0Desired, amount1Desired, amount0Min, amount1Min } =
//       getOrderedTokenAmounts(
//         inputOneAmount,
//         inputTwoAmount,
//         token0Address,
//         token1Address,
//         poolToken0.token.coinDecimals,
//         poolToken1.token.coinDecimals,
//         slippageTolerance,
//       );
//
//     const reverseTokenOrder = needToReverseTokenOrder(
//       token0Address,
//       token1Address,
//     );
//
//     let token0, token1;
//     if (reverseTokenOrder) {
//       token0 = token1Address;
//       token1 = token0Address;
//     } else {
//       token0 = token0Address;
//       token1 = token1Address;
//     }
//
//     try {
//       setTxnStatus(TXN_STATUS.PENDING);
//       const deadline = Math.floor(Date.now() / 1000) + 10 * 60;
//
//       const NonfungiblePositionManagerService =
//         createNonfungiblePositionManagerService(
//           wagmiConfig,
//           selectedChain.contracts.nonfungiblePositionManager.address,
//         );
//
//       // Handle native token if needed
//       let value: bigint = BigInt(0);
//
//       if (poolToken0.token.isNative && !reverseTokenOrder) {
//         value = amount0Desired;
//       } else if (poolToken1.token.isNative && reverseTokenOrder) {
//         value = amount0Desired;
//       } else if (poolToken1.token.isNative && !reverseTokenOrder) {
//         value = amount1Desired;
//       } else if (poolToken0.token.isNative && reverseTokenOrder) {
//         value = amount1Desired;
//       }
//
//       const tx = await NonfungiblePositionManagerService.mint(
//         chainId,
//         token0,
//         token1,
//         rawFeeTier,
//         poolPosition.tickLower,
//         poolPosition.tickUpper,
//         amount0Desired,
//         amount1Desired,
//         amount0Min,
//         amount1Min,
//         address,
//         deadline,
//         value,
//       );
//
//       setTxnHash(tx);
//       setTxnStatus(TXN_STATUS.SUCCESS);
//       return tx;
//     } catch (error) {
//       console.error("Error minting new position:", error);
//       setTxnStatus(TXN_STATUS.FAILED);
//     }
//   };
//
//   return {
//     txnStatus,
//     txnHash,
//     mintNewPosition,
//   };
// };

// NOTE: This is a temporary hack to get rid of a error
export const useMintNewPosition = () => {};
