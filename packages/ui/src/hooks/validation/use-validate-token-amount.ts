import Big from "big.js";

import {
  type Validation,
  type ValidationError,
  type ValidationToken,
} from "./types";

export enum ValidateTokenAmountErrorType {
  INVALID_AMOUNT = "INVALID_AMOUNT",
  INVALID_DECIMALS = "INVALID_DECIMALS",
  ZERO_AMOUNT = "ZERO_AMOUNT",
  BELOW_MINIMUM = "BELOW_MINIMUM",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
}

type Params = {
  value: string;
  token: ValidationToken;
  decimals?: number;
  minimum?: string;
  maximum?: string;
  canBeZero?: boolean;
};

type ValidateState = Pick<
  Validation<ValidateTokenAmountErrorType>,
  "isValid"
> & {
  number: boolean;
  decimals: boolean;
  minimum: boolean;
  maximum: boolean;
  zero: boolean;
};

export const validate = ({
  value,
  decimals,
  minimum,
  maximum,
  canBeZero = true,
}: Params): ValidateState => {
  const res = {
    number: false,
    decimals: false,
    minimum: false,
    maximum: false,
    zero: false,
  };

  if (!value) {
    return { ...res, isValid: false };
  }

  try {
    const amount = Big(value);

    res.number = true;
    res.minimum = minimum !== undefined ? amount.gte(minimum) : true;
    res.maximum = maximum !== undefined ? amount.lte(maximum) : true;
    res.zero = canBeZero || amount.gt(0);

    const decimalIndex = value.indexOf(".");
    const decimal =
      decimalIndex !== -1 ? value.substring(decimalIndex + 1) : undefined;
    res.decimals =
      decimals !== undefined
        ? decimal
          ? decimal.length <= decimals
          : true
        : true;
    // eslint-disable-next-line no-empty
  } catch {}

  return {
    ...res,
    isValid: Object.values(res).every((it) => !!it),
  };
};

export const useValidateTokenAmount = () => {
  return (params: Params): Validation<ValidateTokenAmountErrorType> => {
    const state = validate(params);

    const errors: ValidationError<ValidateTokenAmountErrorType>[] = [];

    if (!state.number) {
      errors.push({
        type: ValidateTokenAmountErrorType.INVALID_AMOUNT,
        message: `Invalid amount.`,
      });
    }
    if (!state.decimals) {
      errors.push({
        type: ValidateTokenAmountErrorType.INVALID_DECIMALS,
        message: `Invalid amount. Maximum ${params.decimals} decimals.`,
      });
    }
    if (!state.zero) {
      errors.push({
        type: ValidateTokenAmountErrorType.ZERO_AMOUNT,
        message: `Amount cannot be 0.`,
      });
    }
    if (!state.minimum) {
      errors.push({
        type: ValidateTokenAmountErrorType.BELOW_MINIMUM,
        message: `The minimum amount is ${params.minimum}.`,
      });
    }
    if (!state.maximum) {
      errors.push({
        type: ValidateTokenAmountErrorType.INSUFFICIENT_BALANCE,
        message: `Insufficient ${params.token.symbol} balance.`,
      });
    }

    return { isValid: state.isValid, errors };
  };
};
