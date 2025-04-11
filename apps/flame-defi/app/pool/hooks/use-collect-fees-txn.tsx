// import {
//   ErrorWithMessage,
//   TokenInputState,
//   TXN_STATUS,
// } from "@repo/flame-types";
// import { HexString } from "@repo/flame-types";
// import { PoolToken } from "pool/types";
// import { useEffect, useState } from "react";
// import { useAccount, useWaitForTransactionReceipt } from "wagmi";
// import { usePoolPositionContext } from ".";
// // import { createNonfungiblePositionManagerService } from "features/evm-wallet";
// // import { useEvmChainData } from "config";

// // NOTE - THIS IS ALL A WIP
// export const useCollectFeesTxn = (
//   feesToCollect: PoolToken[],
//   isCollectAsWrappedNative: boolean,
// ) => {
//   const { positionNftId } = usePoolPositionContext();
//   const { address } = useAccount();
//   const wagmiConfig = useConfig();
//   const { selectedChain } = useEvmChainData();
//   const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);
//   const [txnHash, setTxnHash] = useState<HexString | undefined>(undefined);
//   const [errorText, setErrorText] = useState<string | null>(null);
//   const { data: transactionData } = useWaitForTransactionReceipt({
//     hash: txnHash,
//   });

//   useEffect(() => {
//     if (!txnHash) return;
//     if (transactionData?.status === "success") {
//       setTxnStatus(TXN_STATUS.SUCCESS);
//     } else if (transactionData?.status === "reverted") {
//       setTxnStatus(TXN_STATUS.FAILED);
//       setErrorText("Transaction reverted");
//     } else if (transactionData?.status === "error") {
//       setTxnStatus(TXN_STATUS.FAILED);
//       setErrorText("Transaction failed");
//     }
//   }, [transactionData, txnHash, setTxnStatus]);

//   const formatFeesToCollectToTokenInputState = (
//     feesToCollect: PoolToken[],
//   ): TokenInputState[] => {
//     return feesToCollect.map((data) => {
//       return {
//         token: data.token,
//         value: data.unclaimedFees?.toString() || "0",
//       };
//     });
//   };

//   const tokenInputs = formatFeesToCollectToTokenInputState(feesToCollect);

//   const collectFees = async () => {
//     if (
//       !address ||
//       !feesToCollect ||
//       feesToCollect.length === 0 ||
//       !positionNftId ||
//       !tokenInputs[0] ||
//       !tokenInputs[1]
//     ) {
//       console.warn("Missing required data for collecting fees");
//       return;
//     }

//     // Check if there are any fees to collect
//     const hasAccruedFees = feesToCollect.some(
//       (token) => token.unclaimedFees !== undefined && token.unclaimedFees > 0n,
//     );

//     if (!hasAccruedFees) {
//       console.warn("No fees to collect");
//       setErrorText("No fees to collect");
//       return;
//     }

//     try {
//       setTxnStatus(TXN_STATUS.PENDING);

//       // const nonfungiblePositionService = createNonfungiblePositionManagerService(
//       //   wagmiConfig,
//       //   selectedChain.contracts.nonfungiblePositionManager.address
//       // );

//       console.log("Collecting fees for position:", {
//         positionNftId,
//         feesToCollect,
//         isCollectAsWrappedNative,
//         recipient: address,
//       });

//       //   const tx = await nonfungiblePositionService.collect(
//       //     positionNftId,
//       //     address, // recipient is the user's address
//       //     selectedChain
//       //   );

//       //   setTxnHash(tx);
//     } catch (error) {
//       if ((error as ErrorWithMessage).message.includes("User rejected")) {
//         console.warn(error);
//         setErrorText("Transaction rejected");
//         setTxnStatus(TXN_STATUS.FAILED);
//       } else {
//         console.warn(error);
//         setErrorText("Error collecting fees");
//         setTxnStatus(TXN_STATUS.FAILED);
//       }
//     }
//   };

//   return { txnStatus, txnHash, errorText, setTxnStatus, collectFees };
// };
