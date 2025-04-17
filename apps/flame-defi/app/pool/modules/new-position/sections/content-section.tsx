// "use client";

// import { EvmCurrency, TokenInputState, TXN_STATUS } from "@repo/flame-types";
// import { ConfirmationModal } from "components/confirmation-modal/confirmation-modal";
// import { useEvmChainData } from "config";
// import { PoolTxnSteps } from "pool/components";
// import { usePoolContext } from "pool/hooks";
// import { FeeData } from "pool/types";
// import { useEffect, useState } from "react";
// import { useIntl } from "react-intl";
// import {
//   FeeRange,
//   NewPositionInputs,
//   NewPositionPriceRange,
// } from "../components";

// export const ContentSection = () => {
//   const { formatNumber } = useIntl();
//   const { modalOpen, setModalOpen, maxPrice, updateMaxPrice } =
//     usePoolContext();
//   // const { currentPrice } = usePoolPositionContext();
//   const {
//     selectedChain: { currencies },
//   } = useEvmChainData();

//   const defaultFeeData = feeData[2] as FeeData;

//   const [selectedFeeTier, setSelectedFeeTier] =
//     useState<FeeData>(defaultFeeData);
//   const [txnStatus, setTxnStatus] = useState<TXN_STATUS>(TXN_STATUS.IDLE);

//   const [input0, setInput0] = useState<TokenInputState>({
//     token: currencies[0],
//     value: "",
//     isQuoteValue: false,
//   });
//   const [input1, setInput1] = useState<TokenInputState>({
//     token: null,
//     value: "",
//     isQuoteValue: true,
//   });
//   const [currentPrice, setCurrentPrice] = useState<number>(1); // Add current price state

//   // Update max price when fee tier or tokens change
//   useEffect(() => {
//     if (input0.token && input1.token) {
//       updateMaxPrice(
//         selectedFeeTier.feeTier,
//         input0.token.coinDecimals,
//         input1.token.coinDecimals,
//       );
//     }
//   }, [selectedFeeTier.feeTier, updateMaxPrice, input0.token, input1.token]);

//   const feeTier = selectedFeeTier.feeTier / 1_000_000;

//   // Auto-populate input1 based on input0
//   useEffect(() => {
//     if (!input0.value || !input1.token || (!input0.token && !input1.token)) {
//       return;
//     }
//   }, [input0.token, input0.value, input1.token, input1.value]);

//   return (
//     <div className="flex flex-col md:flex-row gap-4 mt-0 md:mt-12 h-fit">
//       <div className="flex flex-col gap-4 w-full md:w-1/2">
//         <NewPositionInputs
//           input0={input0}
//           input1={input1}
//           setInput0={setInput0}
//           setInput1={setInput1}
//           currencies={currencies}
//         />
//         <FeeRange
//           selectedFeeTier={selectedFeeTier}
//           setSelectedFeeTier={setSelectedFeeTier}
//         />
//       </div>
//       <div className="flex flex-col gap-4 w-full md:w-1/2">
//         <NewPositionPriceRange minPrice={"0"} maxPrice={maxPrice} />
//         <ConfirmationModal
//           open={modalOpen}
//           buttonText={"Create Position"}
//           actionButtonText={
//             txnStatus === TXN_STATUS.PENDING ? "Close" : "Add liquidity"
//           }
//           showOpenButton={true}
//           handleOpenModal={() => setModalOpen(true)}
//           handleModalActionButton={() => {
//             if (txnStatus === TXN_STATUS.IDLE) {
//               setTxnStatus(TXN_STATUS.PENDING);
//             } else {
//               setTxnStatus(TXN_STATUS.IDLE);
//               setModalOpen(false);
//             }
//           }}
//           handleCloseModal={() => setModalOpen(false)}
//           title={"New position"}
//         >
//           {input0.token && input1.token && (
//             <PoolTxnSteps
//               txnStatus={txnStatus}
//               poolTokens={[
//                 {
//                   token: input0.token as EvmCurrency,
//                   unclaimedFees: 0,
//                   liquidity: 0,
//                   liquidityPercentage: 0,
//                 },
//                 {
//                   token: input1.token as EvmCurrency,
//                   unclaimedFees: 0,
//                   liquidity: 0,
//                   liquidityPercentage: 0,
//                 },
//               ]}
//               addLiquidityInputValues={[input0.value, input1.value]}
//               selectedFeeTier={formatNumber(feeTier, {
//                 style: "percent",
//                 minimumFractionDigits: 1,
//                 maximumFractionDigits: 2,
//               })}
//               txnHash={"0x"}
//               txnMsg={""}
//             />
//           )}
//         </ConfirmationModal>
//       </div>
//     </div>
//   );
// };
