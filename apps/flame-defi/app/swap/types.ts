import { type Hash } from "viem";

import {
  EvmCurrency,
  TokenInputState,
  type TransactionStatus,
} from "@repo/flame-types";

/**
 * @deprecated Use `InputId` instead.`
 */
export enum SWAP_INPUT_ID {
  INPUT_ONE = "input_one",
  INPUT_TWO = "input_two",
}

export enum InputId {
  INPUT_0 = "INPUT_0",
  INPUT_1 = "INPUT_1",
}

export interface OneToOneQuoteProps {
  topTokenSymbol?: string;
  bottomTokenSymbol?: string;
  bottomTokenValue?: string;
  oneToOneLoading: boolean;
  flipDirection: boolean;
  setFlipDirection: (flipDirection: boolean) => void;
}

export interface SwapPairProps {
  id: SWAP_INPUT_ID;
  inputToken: TokenInputState;
  oppositeToken: TokenInputState;
  balance: string;
  label: string;
}

export interface TransactionStepsProps {
  expectedOutputFormatted?: string;
  token0: TokenInputState;
  token1: TokenInputState;
  isTiaWtia: boolean;
  hash?: Hash;
  message?: string;
}

export interface TransactionDetailsProps extends TransactionStepsProps {
  priceImpact?: string;
  minimumReceived?: string;
  oneToOneQuote: OneToOneQuoteProps;
  isQuoteLoading: boolean;
  frontendFeeEstimate?: string;
}

export interface TransactionInfo {
  transactionQuoteDataLoading: boolean;
  gasUseEstimateUSD: string;
  formattedGasUseEstimateUSD: string;
  expectedOutputBigInt: bigint;
  expectedOutputFormatted: string;
  priceImpact: string;
  minimumReceived: string;
  frontendFeeEstimate?: string;
}

export interface SwapTransactionStepsProps {
  info: TransactionInfo;
  token0: TokenInputState;
  token1: TokenInputState;
  status?: TransactionStatus;
  hash?: Hash;
  message?: string;
  isTiaWtia: boolean;
  oneToOneQuote: OneToOneQuoteProps;
  isQuoteLoading: boolean;
}

export interface SwapInputProps extends SwapPairProps {
  onInputChange: (value: string, inputId: SWAP_INPUT_ID) => void;
  onTokenSelect: (
    token: EvmCurrency,
    oppositeToken: TokenInputState,
    inputId: SWAP_INPUT_ID,
  ) => void;
  availableTokens: EvmCurrency[];
  label: string;
  isQuoteLoading: boolean;
}
