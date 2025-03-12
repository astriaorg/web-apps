import { EvmCurrency, TokenInputState, TXN_STATUS } from "@repo/flame-types";

export enum SWAP_INPUT_ID {
  INPUT_ONE = "input_one",
  INPUT_TWO = "input_two",
}

export interface OneToOneQuoteProps {
  topTokenSymbol: string | undefined;
  bottomTokenSymbol: string | undefined;
  bottomTokenValue: string | undefined;
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

export interface TxnStepsProps {
  expectedOutputFormatted?: string;
  topToken: TokenInputState;
  bottomToken: TokenInputState;
  isTiaWtia: boolean;
  txnHash?: `0x${string}`;
  txnMsg?: string;
}

export interface TxnDetailsProps extends TxnStepsProps {
  priceImpact: string | undefined;
  minimumReceived: string | undefined;
  oneToOneQuote: OneToOneQuoteProps;
}

export interface TransactionInfo {
  txnQuoteDataLoading: boolean;
  gasUseEstimateUSD: string | undefined;
  formattedGasUseEstimateUSD: string;
  expectedOutputBigInt: bigint;
  expectedOutputFormatted: string;
  priceImpact: string;
  minimumReceived: string;
}

export interface SwapTxnStepsProps {
  txnInfo: TransactionInfo;
  topToken: TokenInputState;
  bottomToken: TokenInputState;
  txnStatus: TXN_STATUS | undefined;
  txnHash: `0x${string}` | undefined;
  txnMsg: string | undefined;
  isTiaWtia: boolean;
  oneToOneQuote: OneToOneQuoteProps;
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
  txnQuoteLoading: boolean;
}
