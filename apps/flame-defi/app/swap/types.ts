import { type Hash } from "viem";

import {
  type Balance,
  EvmCurrency,
  TokenInputState,
  type TransactionStatus,
} from "@repo/flame-types";

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
  id: InputId;
  inputToken: TokenInputState;
  oppositeToken: TokenInputState;
  balance: Balance | null;
  isBalanceLoading: boolean;
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
  onInputChange: (value: string, inputId: InputId) => void;
  onTokenSelect: (
    token: EvmCurrency,
    oppositeToken: TokenInputState,
    inputId: InputId,
  ) => void;
  availableTokens: EvmCurrency[];
  label: string;
  isQuoteLoading: boolean;
  isBalanceLoading: boolean;
}
